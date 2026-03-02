"""Service layer for OAM imagery DB operations."""

from datetime import datetime, timezone
from typing import Optional

import httpx
from geoalchemy2.functions import ST_GeomFromText, ST_Intersects, ST_MakeEnvelope
from sqlalchemy import asc, desc, func, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.oam import OAMImage

OAM_API_BASE_URL = "https://api.openaerialmap.org"


def _bbox_to_wkt(bbox: list[float]) -> str:
    """Convert [min_lon, min_lat, max_lon, max_lat] to WKT POLYGON."""
    min_lon, min_lat, max_lon, max_lat = bbox
    return (
        f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, "
        f"{max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
    )


def _oam_item_to_row(item: dict) -> dict:
    """Convert a raw OAM API result dict to a DB row dict."""
    props = item.get("properties") or {}
    bbox = item.get("bbox")
    geometry_wkt = _bbox_to_wkt(bbox) if bbox and len(bbox) == 4 else None

    acq_raw = item.get("acquisition_end")
    acquisition_end = None
    if acq_raw:
        try:
            acquisition_end = datetime.fromisoformat(
                acq_raw.replace("Z", "+00:00")
            )
        except (ValueError, AttributeError):
            pass

    return {
        "id": item.get("_id"),
        "title": item.get("title"),
        "bbox": bbox,
        "geometry": geometry_wkt,
        "gsd": item.get("gsd"),
        "acquisition_end": acquisition_end,
        "provider": item.get("provider"),
        "tms_url": props.get("tms"),
        "thumbnail_url": props.get("thumbnail"),
        "synced_at": datetime.now(timezone.utc),
    }


async def upsert_images(db: AsyncSession, images: list[dict]) -> int:
    """
    Upsert a batch of OAM image rows into the DB.
    Uses PostgreSQL INSERT ... ON CONFLICT DO UPDATE.
    Returns number of rows processed.
    """
    if not images:
        return 0

    rows = [r for r in (_oam_item_to_row(img) for img in images) if r.get("id")]

    if not rows:
        return 0

    stmt = insert(OAMImage).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=["id"],
        set_={
            "title": stmt.excluded.title,
            "bbox": stmt.excluded.bbox,
            "geometry": stmt.excluded.geometry,
            "gsd": stmt.excluded.gsd,
            "acquisition_end": stmt.excluded.acquisition_end,
            "provider": stmt.excluded.provider,
            "tms_url": stmt.excluded.tms_url,
            "thumbnail_url": stmt.excluded.thumbnail_url,
            "synced_at": stmt.excluded.synced_at,
        },
    )
    await db.execute(stmt)
    await db.commit()
    return len(rows)


async def sync_from_oam_api(db: AsyncSession) -> int:
    """
    Fetch all public imagery from OAM API and upsert into DB.
    Returns total number of images upserted.
    """
    print("Starting OAM sync from API...")
    url = f"{OAM_API_BASE_URL}/meta"
    params = {"limit": 99999, "sort": "desc"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    results = data.get("results", [])
    if not results:
        print("OAM API returned 0 results")
        return 0

    # Upsert in batches of 500 to avoid huge transactions
    batch_size = 500
    total = 0
    for i in range(0, len(results), batch_size):
        batch = results[i : i + batch_size]
        count = await upsert_images(db, batch)
        total += count

    print(f"OAM sync complete: {total} images upserted")
    return total


async def query_images(
    db: AsyncSession,
    limit: int = 10,
    page: int = 1,
    sort: str = "desc",
    bbox: Optional[str] = None,
    title: Optional[str] = None,
    provider: Optional[str] = None,
    gsd_from: Optional[float] = None,
    gsd_to: Optional[float] = None,
    acquisition_from: Optional[str] = None,
    acquisition_to: Optional[str] = None,
    has_tiled: Optional[bool] = None,
) -> dict:
    """
    Query OAM images from DB with optional filters.
    Returns a dict compatible with the OAM API response format.
    """
    query = select(OAMImage)

    # Spatial filter: bbox intersection using PostGIS
    if bbox:
        try:
            min_lon, min_lat, max_lon, max_lat = (float(x) for x in bbox.split(","))
            envelope = ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)
            query = query.where(ST_Intersects(OAMImage.geometry, envelope))
        except (ValueError, TypeError):
            pass  # Invalid bbox — ignore filter

    if title:
        query = query.where(OAMImage.title.ilike(f"%{title}%"))

    if provider:
        query = query.where(OAMImage.provider.ilike(f"%{provider}%"))

    if gsd_from is not None:
        query = query.where(OAMImage.gsd >= gsd_from)

    if gsd_to is not None:
        query = query.where(OAMImage.gsd <= gsd_to)

    if acquisition_from:
        try:
            dt = datetime.fromisoformat(acquisition_from)
            query = query.where(OAMImage.acquisition_end >= dt)
        except ValueError:
            pass

    if acquisition_to:
        try:
            dt = datetime.fromisoformat(acquisition_to)
            query = query.where(OAMImage.acquisition_end <= dt)
        except ValueError:
            pass

    if has_tiled is True:
        query = query.where(OAMImage.tms_url.isnot(None))
    elif has_tiled is False:
        query = query.where(OAMImage.tms_url.is_(None))

    # Count total matching rows
    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar() or 0

    # Ordering
    order_col = OAMImage.acquisition_end
    order_fn = desc if sort == "desc" else asc
    query = query.order_by(order_fn(order_col))

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    rows = (await db.execute(query)).scalars().all()

    results = [_row_to_api_dict(row) for row in rows]

    return {
        "meta": {
            "found": total_count,
            "limit": limit,
            "page": page,
        },
        "results": results,
    }


async def query_all_images(db: AsyncSession) -> dict:
    """
    Return all OAM images in compact snapshot format for the /projects/all endpoint.
    """
    query = select(OAMImage).order_by(desc(OAMImage.acquisition_end))
    rows = (await db.execute(query)).scalars().all()

    stats = await get_db_stats(db)
    results = [_row_to_compact_dict(row) for row in rows]

    return {
        "count": len(results),
        "updated_at": stats.get("last_synced_at", datetime.now(timezone.utc).isoformat()),
        "results": results,
    }


async def get_image_by_id(db: AsyncSession, image_id: str) -> Optional[dict]:
    """Retrieve a single OAM image by its ID. Returns None if not found."""
    row = await db.get(OAMImage, image_id)
    if row is None:
        return None
    return _row_to_api_dict(row)


async def get_db_stats(db: AsyncSession) -> dict:
    """Return count and last sync time from the oam_images table."""
    result = await db.execute(
        select(func.count(OAMImage.id), func.max(OAMImage.synced_at))
    )
    count, last_synced = result.one()
    return {
        "count": count or 0,
        "last_synced_at": last_synced.isoformat() if last_synced else None,
    }


async def is_db_empty(db: AsyncSession) -> bool:
    """Return True if the oam_images table has no rows."""
    result = await db.execute(select(func.count(OAMImage.id)))
    return (result.scalar() or 0) == 0


# ── Internal helpers ──────────────────────────────────────────────────────────


def _row_to_api_dict(row: OAMImage) -> dict:
    """Serialize an OAMImage row to the full OAM API response format."""
    return {
        "_id": row.id,
        "title": row.title,
        "bbox": row.bbox,
        "gsd": row.gsd,
        "acquisition_end": row.acquisition_end.isoformat() if row.acquisition_end else None,
        "provider": row.provider,
        "properties": {
            "tms": row.tms_url,
            "thumbnail": row.thumbnail_url,
        },
    }


def _row_to_compact_dict(row: OAMImage) -> dict:
    """Serialize an OAMImage row to compact snapshot format (short field names)."""
    compact = {
        "_id": row.id,
        "t": row.title,
        "bbox": row.bbox,
        "gsd": row.gsd,
        "acq": row.acquisition_end.isoformat() if row.acquisition_end else None,
        "prov": row.provider,
        "tms": row.tms_url,
        "th": row.thumbnail_url,
    }
    return {k: v for k, v in compact.items() if v is not None}

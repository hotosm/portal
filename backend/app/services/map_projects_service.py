"""Service layer for unified homepage map projects in Postgres."""

import asyncio
from datetime import datetime, timezone
import logging
import re

import httpx

logger = logging.getLogger(__name__)
from sqlalchemy import and_, case, delete, func, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.map_project import MapProject
from app.db.models.map_project_sync_state import MapProjectSyncState
from app.db.models.oam import OAMImage
from app.services import oam_service

TASKING_MANAGER_API_BASE_URL = settings.tasking_manager_api_url
FAIR_CENTROIDS_URL = f"{settings.fair_api_url}/models/centroid/"
CHATMAP_PUBLIC_MAP_URL = f"{settings.chatmap_api_url}/map"
UPSERT_CHUNK_SIZE = 2000


def to_iso_datetime(value: object) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return None


def parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def identity_sort_key(identity: str | None) -> tuple[int, int | str]:
    if identity is None:
        return (-1, "")
    value = str(identity)
    if value.isdigit():
        return (1, int(value))
    return (0, value)


def normalize_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def is_newer_cursor(
    candidate_created_at: datetime | None,
    candidate_identity: str,
    current_created_at: datetime | None,
    current_identity: str | None,
) -> bool:
    candidate_created_at = normalize_utc(candidate_created_at)
    current_created_at = normalize_utc(current_created_at)

    if current_created_at and candidate_created_at:
        if candidate_created_at > current_created_at:
            return True
        if candidate_created_at < current_created_at:
            return False
        return identity_sort_key(candidate_identity) > identity_sort_key(current_identity)

    if current_created_at and not candidate_created_at:
        return identity_sort_key(candidate_identity) > identity_sort_key(current_identity)

    if not current_created_at and candidate_created_at:
        return True

    return identity_sort_key(candidate_identity) > identity_sort_key(current_identity)


def build_row(
    product: str,
    project_id: str,
    lon: float,
    lat: float,
    name: str | None = None,
    metadata_json: dict | None = None,
) -> dict:
    metadata = dict(metadata_json or {})
    metadata.setdefault("source_id", str(project_id))
    return {
        "id": f"{product}:{project_id}",
        "product": product,
        "project_id": str(project_id),
        "name": name,
        "longitude": lon,
        "latitude": lat,
        "metadata_json": metadata,
        "synced_at": datetime.now(timezone.utc),
    }


def extract_point_coordinates(geometry: dict | None) -> tuple[float, float] | None:
    if not geometry:
        return None

    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates")

    if geometry_type == "Point" and isinstance(coordinates, list) and len(coordinates) >= 2:
        lon = float(coordinates[0])
        lat = float(coordinates[1])
        if -180 <= lon <= 180 and -90 <= lat <= 90:
            return lon, lat

    points: list[tuple[float, float]] = []

    def collect_points(values: object) -> None:
        if (
            isinstance(values, list)
            and len(values) >= 2
            and isinstance(values[0], (int, float))
            and isinstance(values[1], (int, float))
        ):
            lon = float(values[0])
            lat = float(values[1])
            if -180 <= lon <= 180 and -90 <= lat <= 90:
                points.append((lon, lat))
            return

        if isinstance(values, list):
            for value in values:
                collect_points(value)

    collect_points(coordinates)
    if points:
        lons = [p[0] for p in points]
        lats = [p[1] for p in points]
        return (min(lons) + max(lons)) / 2, (min(lats) + max(lats)) / 2

    return None


async def fetch_tasking_manager_rows(client: httpx.AsyncClient) -> list[dict]:
    response = await client.get(
        f"{TASKING_MANAGER_API_BASE_URL}/projects/",
        params={"action": "any", "omitMapResults": "false"},
    )
    response.raise_for_status()
    data = response.json()

    rows: list[dict] = []
    for feature in data.get("mapResults", {}).get("features", []):
        project_id = feature.get("properties", {}).get("projectId")
        if project_id is None:
            continue
        coords = extract_point_coordinates(feature.get("geometry"))
        if not coords:
            continue
        rows.append(
            build_row(
                product="tasking-manager",
                project_id=str(project_id),
                lon=coords[0],
                lat=coords[1],
                name=feature.get("properties", {}).get("name"),
                metadata_json={
                    "source_project_id": str(project_id),
                    "created_at": to_iso_datetime(
                        feature.get("properties", {}).get("created")
                        or feature.get("properties", {}).get("createdAt")
                    ),
                },
            )
        )

    return rows


async def fetch_dronetm_rows(client: httpx.AsyncClient) -> list[dict]:
    page = 1
    per_page = 1000
    rows: list[dict] = []

    while True:
        response = await client.get(
            f"{settings.drone_tm_api_url}/projects/centroids",
            params={"filter_by_owner": "false", "page": page, "results_per_page": per_page},
        )
        response.raise_for_status()
        data = response.json()
        results = data if isinstance(data, list) else data.get("results", [])

        for item in results:
            project_id = item.get("id")
            centroid = item.get("centroid") or {}
            coords = extract_point_coordinates(centroid)
            if project_id is None or not coords:
                continue
            rows.append(
                build_row(
                    product="drone-tasking-manager",
                    project_id=str(project_id),
                    lon=coords[0],
                    lat=coords[1],
                    name=item.get("name"),
                    metadata_json={
                        "source_uuid": str(project_id),
                        "created_at": to_iso_datetime(item.get("created") or item.get("created_at")),
                    },
                )
            )

        if isinstance(data, list):
            break

        pagination = data.get("pagination") if isinstance(data, dict) else None
        if isinstance(pagination, dict):
            total = pagination.get("total")
            current_page = pagination.get("page") or page
            current_per_page = pagination.get("per_page") or per_page

            if isinstance(total, int) and isinstance(current_page, int) and isinstance(current_per_page, int):
                if current_page * current_per_page >= total:
                    break
            elif len(results) < per_page:
                break
        elif len(results) < per_page:
            break

        if not results:
            break

        page += 1

    return rows


async def fetch_fair_rows(client: httpx.AsyncClient) -> list[dict]:
    async def fetch_rows_from_url(url: str) -> list[dict]:
        response = await client.get(url, headers={"accept": "application/json"})
        response.raise_for_status()
        data = response.json()

        rows: list[dict] = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            model_id = props.get("mid")
            coords = extract_point_coordinates(feature.get("geometry"))
            if model_id is None or not coords:
                continue
            rows.append(
                build_row(
                    product="fair",
                    project_id=str(model_id),
                    lon=coords[0],
                    lat=coords[1],
                    name=props.get("name"),
                    metadata_json={
                        "source_mid": str(model_id),
                        "created_at": to_iso_datetime(
                            props.get("created")
                            or props.get("created_at")
                            or props.get("creation_date")
                        ),
                    },
                )
            )
        return rows

    return await fetch_rows_from_url(FAIR_CENTROIDS_URL)


async def fetch_umap_rows(client: httpx.AsyncClient) -> list[dict]:
    response = await client.get(
        f"{settings.umap_base_url}/en/showcase/",
        headers={"accept": "application/json"},
        follow_redirects=True,
    )
    response.raise_for_status()
    data = response.json()

    rows: list[dict] = []
    for feature in data.get("features", []):
        geometry = feature.get("geometry")
        coords = extract_point_coordinates(geometry)
        if not coords:
            continue

        props = feature.get("properties", {})
        description = props.get("description") or ""
        map_match = re.search(r"\[\[(/en/map/[^|]+)\|[^\]]+\]\]", description)
        map_path = map_match.group(1) if map_match else None
        map_id = None
        if map_path:
            parts = map_path.rsplit("_", 1)
            if len(parts) > 1 and parts[-1].isdigit():
                map_id = parts[-1]

        if not map_id:
            continue

        rows.append(
            build_row(
                product="umap",
                project_id=str(map_id),
                lon=coords[0],
                lat=coords[1],
                name=props.get("name"),
                metadata_json={
                    "source_map_id": str(map_id),
                    "created_at": to_iso_datetime(
                        props.get("created")
                        or props.get("created_at")
                        or props.get("creation_date")
                    ),
                    "description": description,
                },
            )
        )

    return rows


async def fetch_chatmap_rows(client: httpx.AsyncClient) -> list[dict]:
    response = await client.get(
        CHATMAP_PUBLIC_MAP_URL,
        headers={"accept": "application/json"},
    )
    response.raise_for_status()
    data = response.json()

    rows: list[dict] = []
    for item in data if isinstance(data, list) else []:
        map_id = item.get("id")
        centroid = item.get("centroid")
        if not map_id or not isinstance(centroid, list) or len(centroid) < 2:
            continue
        # chatmap returns [lat, lon]; GeoJSON needs [lon, lat]
        lat, lon = float(centroid[0]), float(centroid[1])
        rows.append(
            build_row(
                product="chatmap",
                project_id=str(map_id),
                lon=lon,
                lat=lat,
                name=item.get("name"),
                metadata_json={
                    "updated_at": to_iso_datetime(item.get("updated_at")),
                },
            )
        )

    return rows


async def fetch_oam_rows_from_db(db: AsyncSession) -> list[dict]:
    state = await db.get(MapProjectSyncState, "imagery")
    last_created_at = state.last_created_at if state else None
    last_identity = state.last_identity if state else None

    query = select(OAMImage)

    if last_created_at:
        if last_identity:
            query = query.where(
                or_(
                    OAMImage.acquisition_end > last_created_at,
                    and_(
                        OAMImage.acquisition_end == last_created_at,
                        OAMImage.id > last_identity,
                    ),
                    and_(
                        OAMImage.acquisition_end.is_(None),
                        OAMImage.id > last_identity,
                    ),
                )
            )
        else:
            query = query.where(OAMImage.acquisition_end > last_created_at)
    elif last_identity:
        query = query.where(OAMImage.id > last_identity)

    rows = (await db.execute(query)).scalars().all()

    if not rows:
        try:
            await oam_service.sync_from_oam_api(db)
            rows = (await db.execute(select(OAMImage))).scalars().all()
        except Exception:
            rows = []

    output: list[dict] = []
    for image in rows:
        if not image.bbox or len(image.bbox) != 4:
            continue
        min_lon, min_lat, max_lon, max_lat = image.bbox
        lon = (min_lon + max_lon) / 2
        lat = (min_lat + max_lat) / 2
        output.append(
            build_row(
                product="imagery",
                project_id=image.id,
                lon=lon,
                lat=lat,
                name=image.title,
                metadata_json={
                    "source_uuid": image.id,
                    "created_at": to_iso_datetime(image.acquisition_end),
                },
            )
        )
    return output


async def delete_product_rows(db: AsyncSession, product: str) -> None:
    """Delete all map_projects rows for a given product before a full re-sync."""
    await db.execute(delete(MapProject).where(MapProject.product == product))


async def upsert_product_rows(db: AsyncSession, rows: list[dict]) -> int:
    if not rows:
        return 0

    affected_total = 0
    for start in range(0, len(rows), UPSERT_CHUNK_SIZE):
        chunk = rows[start : start + UPSERT_CHUNK_SIZE]
        stmt = insert(MapProject).values(chunk).on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": insert(MapProject).excluded.name,
                "longitude": insert(MapProject).excluded.longitude,
                "latitude": insert(MapProject).excluded.latitude,
                "metadata_json": insert(MapProject).excluded.metadata_json,
                "synced_at": insert(MapProject).excluded.synced_at,
            },
        )
        result = await db.execute(stmt)
        affected_total += max(result.rowcount or 0, 0)

    return affected_total


async def get_sync_states(db: AsyncSession) -> dict[str, MapProjectSyncState]:
    states = (await db.execute(select(MapProjectSyncState))).scalars().all()
    return {state.product: state for state in states}


def filter_rows_since_cursor(
    rows: list[dict],
    state: MapProjectSyncState | None,
) -> list[dict]:
    if state is None:
        return rows

    filtered: list[dict] = []
    for row in rows:
        metadata = row.get("metadata_json") or {}
        created_at = parse_iso_datetime(metadata.get("created_at"))
        identity = row["project_id"]
        if is_newer_cursor(created_at, identity, state.last_created_at, state.last_identity):
            filtered.append(row)

    return filtered


def compute_latest_cursor(rows: list[dict]) -> tuple[datetime | None, str | None]:
    latest_created_at: datetime | None = None
    latest_identity: str | None = None

    for row in rows:
        metadata = row.get("metadata_json") or {}
        created_at = parse_iso_datetime(metadata.get("created_at"))
        identity = row["project_id"]
        if is_newer_cursor(created_at, identity, latest_created_at, latest_identity):
            latest_created_at = created_at
            latest_identity = identity

    return latest_created_at, latest_identity


async def upsert_sync_state(
    db: AsyncSession,
    product: str,
    rows: list[dict],
    states: dict[str, MapProjectSyncState],
) -> None:
    if not rows:
        return

    candidate_created_at, candidate_identity = compute_latest_cursor(rows)
    if candidate_identity is None:
        return

    existing = states.get(product)
    if existing is None:
        new_state = MapProjectSyncState(
            product=product,
            last_created_at=candidate_created_at,
            last_identity=candidate_identity,
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_state)
        states[product] = new_state
        return

    if is_newer_cursor(
        candidate_created_at,
        candidate_identity,
        existing.last_created_at,
        existing.last_identity,
    ):
        existing.last_created_at = candidate_created_at
        existing.last_identity = candidate_identity
    existing.updated_at = datetime.now(timezone.utc)


async def sync_from_sources(db: AsyncSession) -> dict[str, int]:
    """Fetch and persist map centroids from all product sources."""
    counts: dict[str, int] = {
        "tasking-manager": 0,
        "drone-tasking-manager": 0,
        "fair": 0,
        "umap": 0,
        "chatmap": 0,
        "imagery": 0,
    }

    async with (
        httpx.AsyncClient(timeout=90.0, verify=True) as default_client,
        httpx.AsyncClient(timeout=90.0, verify=settings.drone_tm_verify_ssl) as drone_client,
        httpx.AsyncClient(timeout=90.0, verify=settings.fair_verify_ssl) as fair_client,
    ):
        tm_result, drone_result, fair_result, umap_result, chatmap_result = await asyncio.gather(
            fetch_tasking_manager_rows(default_client),
            fetch_dronetm_rows(drone_client),
            fetch_fair_rows(fair_client),
            fetch_umap_rows(default_client),
            fetch_chatmap_rows(default_client),
            return_exceptions=True,
        )

    tm_rows = [] if isinstance(tm_result, Exception) else tm_result
    drone_rows = [] if isinstance(drone_result, Exception) else drone_result
    fair_rows = [] if isinstance(fair_result, Exception) else fair_result
    umap_rows = [] if isinstance(umap_result, Exception) else umap_result
    chatmap_rows = [] if isinstance(chatmap_result, Exception) else chatmap_result

    if isinstance(chatmap_result, Exception):
        logger.warning("ChatMap sync failed (non-critical): %s", chatmap_result)

    oam_rows = await fetch_oam_rows_from_db(db)

    states = await get_sync_states(db)

    # For full-refresh products, delete stale rows before re-inserting.
    # Only delete when the fetch succeeded to avoid wiping data on API failures.
    if not isinstance(tm_result, Exception):
        await delete_product_rows(db, "tasking-manager")
    if not isinstance(drone_result, Exception):
        await delete_product_rows(db, "drone-tasking-manager")
    if not isinstance(fair_result, Exception):
        await delete_product_rows(db, "fair")
    if not isinstance(umap_result, Exception):
        await delete_product_rows(db, "umap")
    if not isinstance(chatmap_result, Exception):
        await delete_product_rows(db, "chatmap")

    oam_rows_to_upsert = filter_rows_since_cursor(oam_rows, states.get("imagery"))

    counts["tasking-manager"] = await upsert_product_rows(db, tm_rows)
    counts["drone-tasking-manager"] = await upsert_product_rows(db, drone_rows)
    counts["fair"] = await upsert_product_rows(db, fair_rows)
    counts["umap"] = await upsert_product_rows(db, umap_rows)
    counts["chatmap"] = await upsert_product_rows(db, chatmap_rows)
    counts["imagery"] = await upsert_product_rows(db, oam_rows_to_upsert)

    await upsert_sync_state(db, "tasking-manager", tm_rows, states)
    await upsert_sync_state(db, "drone-tasking-manager", drone_rows, states)
    await upsert_sync_state(db, "fair", fair_rows, states)
    await upsert_sync_state(db, "umap", umap_rows, states)
    await upsert_sync_state(db, "chatmap", chatmap_rows, states)
    await upsert_sync_state(db, "imagery", oam_rows, states)

    await db.commit()

    return counts


async def query_map_projects(db: AsyncSession) -> dict:
    """Return all stored map projects as a GeoJSON FeatureCollection."""
    rows = (
        await db.execute(
            select(MapProject).order_by(
                case(
                    (MapProject.product == "tasking-manager", 1),
                    (MapProject.product == "drone-tasking-manager", 2),
                    (MapProject.product == "fair", 3),
                    (MapProject.product == "umap", 4),
                    (MapProject.product == "imagery", 5),
                    else_=99,
                ),
                MapProject.project_id,
            )
        )
    ).scalars().all()

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row.longitude, row.latitude],
                },
                "properties": {
                    "projectId": row.project_id,
                    "name": row.name,
                    "product": row.product,
                },
            }
            for row in rows
        ],
    }


async def is_db_empty(db: AsyncSession) -> bool:
    result = await db.execute(select(func.count(MapProject.id)))
    return (result.scalar() or 0) == 0

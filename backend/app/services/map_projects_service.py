"""Service layer for unified homepage map projects in Postgres."""

import asyncio
from datetime import datetime, timezone
import re

import httpx
from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.map_project import MapProject
from app.db.models.map_project_sync_state import MapProjectSyncState
from app.db.models.oam import OAMImage
from app.services import oam_service

TASKING_MANAGER_API_BASE_URL = "https://tasking-manager-production-api.hotosm.org/api/v2"
FAIR_PRODUCTION_CENTROIDS_URL = "https://api-prod.fair.hotosm.org/api/v1/models/centroid/"
UPSERT_CHUNK_SIZE = 2000


def _to_iso_datetime(value: object) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return None


def _parse_iso_datetime(value: str | None) -> datetime | None:
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


def _identity_sort_key(identity: str | None) -> tuple[int, int | str]:
    if identity is None:
        return (-1, "")
    value = str(identity)
    if value.isdigit():
        return (1, int(value))
    return (0, value)


def _normalize_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _is_newer_cursor(
    candidate_created_at: datetime | None,
    candidate_identity: str,
    current_created_at: datetime | None,
    current_identity: str | None,
) -> bool:
    candidate_created_at = _normalize_utc(candidate_created_at)
    current_created_at = _normalize_utc(current_created_at)

    if current_created_at and candidate_created_at:
        if candidate_created_at > current_created_at:
            return True
        if candidate_created_at < current_created_at:
            return False
        return _identity_sort_key(candidate_identity) > _identity_sort_key(current_identity)

    if current_created_at and not candidate_created_at:
        return _identity_sort_key(candidate_identity) > _identity_sort_key(current_identity)

    if not current_created_at and candidate_created_at:
        return True

    return _identity_sort_key(candidate_identity) > _identity_sort_key(current_identity)


async def ensure_table_exists(db: AsyncSession) -> None:
    """Create map_projects table if migration has not been applied yet."""
    bind = db.bind
    if bind is None:
        return

    async with bind.begin() as conn:
        await conn.run_sync(lambda sync_conn: MapProject.__table__.create(sync_conn, checkfirst=True))
        await conn.run_sync(
            lambda sync_conn: MapProjectSyncState.__table__.create(sync_conn, checkfirst=True)
        )


def _build_row(
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


def _extract_point_coordinates(geometry: dict | None) -> tuple[float, float] | None:
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


async def _fetch_tasking_manager_rows(client: httpx.AsyncClient) -> list[dict]:
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
        coords = _extract_point_coordinates(feature.get("geometry"))
        if not coords:
            continue
        rows.append(
            _build_row(
                product="tasking-manager",
                project_id=str(project_id),
                lon=coords[0],
                lat=coords[1],
                name=feature.get("properties", {}).get("name"),
                metadata_json={
                    "source_project_id": str(project_id),
                    "created_at": _to_iso_datetime(
                        feature.get("properties", {}).get("created")
                        or feature.get("properties", {}).get("createdAt")
                    ),
                },
            )
        )

    return rows


async def _fetch_dronetm_rows(client: httpx.AsyncClient) -> list[dict]:
    page = 1
    per_page = 1000
    rows: list[dict] = []

    while True:
        response = await client.get(
            f"{settings.drone_tm_backend_url}/projects/centroids",
            params={"filter_by_owner": "false", "page": page, "results_per_page": per_page},
        )
        response.raise_for_status()
        data = response.json()
        results = data if isinstance(data, list) else data.get("results", [])

        for item in results:
            project_id = item.get("id")
            centroid = item.get("centroid") or {}
            coords = _extract_point_coordinates(centroid)
            if project_id is None or not coords:
                continue
            rows.append(
                _build_row(
                    product="drone-tasking-manager",
                    project_id=str(project_id),
                    lon=coords[0],
                    lat=coords[1],
                    name=item.get("name"),
                    metadata_json={
                        "source_uuid": str(project_id),
                        "created_at": _to_iso_datetime(item.get("created") or item.get("created_at")),
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


async def _fetch_fair_rows(client: httpx.AsyncClient) -> list[dict]:
    async def fetch_rows_from_url(url: str) -> list[dict]:
        response = await client.get(url, headers={"accept": "application/json"})
        response.raise_for_status()
        data = response.json()

        rows: list[dict] = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            model_id = props.get("mid")
            coords = _extract_point_coordinates(feature.get("geometry"))
            if model_id is None or not coords:
                continue
            rows.append(
                _build_row(
                    product="fair",
                    project_id=str(model_id),
                    lon=coords[0],
                    lat=coords[1],
                    name=props.get("name"),
                    metadata_json={
                        "source_mid": str(model_id),
                        "created_at": _to_iso_datetime(
                            props.get("created")
                            or props.get("created_at")
                            or props.get("creation_date")
                        ),
                    },
                )
            )
        return rows

    primary_url = f"{settings.effective_fair_api_base_url}/models/centroid/"
    primary_rows = await fetch_rows_from_url(primary_url)

    if primary_url.rstrip("/") == FAIR_PRODUCTION_CENTROIDS_URL.rstrip("/"):
        return primary_rows

    try:
        fallback_rows = await fetch_rows_from_url(FAIR_PRODUCTION_CENTROIDS_URL)
        return fallback_rows if len(fallback_rows) > len(primary_rows) else primary_rows
    except Exception:
        return primary_rows


async def _fetch_umap_rows(client: httpx.AsyncClient) -> list[dict]:
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
        coords = _extract_point_coordinates(geometry)
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
            _build_row(
                product="umap",
                project_id=str(map_id),
                lon=coords[0],
                lat=coords[1],
                name=props.get("name"),
                metadata_json={
                    "source_map_id": str(map_id),
                    "created_at": _to_iso_datetime(
                        props.get("created")
                        or props.get("created_at")
                        or props.get("creation_date")
                    ),
                    "description": description,
                },
            )
        )

    return rows


async def _fetch_oam_rows_from_db(db: AsyncSession) -> list[dict]:
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
            _build_row(
                product="imagery",
                project_id=image.id,
                lon=lon,
                lat=lat,
                name=image.title,
                metadata_json={
                    "source_uuid": image.id,
                    "created_at": _to_iso_datetime(image.acquisition_end),
                },
            )
        )
    return output


async def _upsert_product_rows(db: AsyncSession, rows: list[dict]) -> int:
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


async def _get_sync_states(db: AsyncSession) -> dict[str, MapProjectSyncState]:
    states = (await db.execute(select(MapProjectSyncState))).scalars().all()
    return {state.product: state for state in states}


def _filter_rows_since_cursor(
    rows: list[dict],
    state: MapProjectSyncState | None,
) -> list[dict]:
    if state is None:
        return rows

    filtered: list[dict] = []
    for row in rows:
        metadata = row.get("metadata_json") or {}
        created_at = _parse_iso_datetime(metadata.get("created_at"))
        identity = row["project_id"]
        if _is_newer_cursor(created_at, identity, state.last_created_at, state.last_identity):
            filtered.append(row)

    return filtered


def _compute_latest_cursor(rows: list[dict]) -> tuple[datetime | None, str | None]:
    latest_created_at: datetime | None = None
    latest_identity: str | None = None

    for row in rows:
        metadata = row.get("metadata_json") or {}
        created_at = _parse_iso_datetime(metadata.get("created_at"))
        identity = row["project_id"]
        if _is_newer_cursor(created_at, identity, latest_created_at, latest_identity):
            latest_created_at = created_at
            latest_identity = identity

    return latest_created_at, latest_identity


async def _upsert_sync_state(
    db: AsyncSession,
    product: str,
    rows: list[dict],
    states: dict[str, MapProjectSyncState],
) -> None:
    if not rows:
        return

    candidate_created_at, candidate_identity = _compute_latest_cursor(rows)
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

    if _is_newer_cursor(
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
    await ensure_table_exists(db)

    counts: dict[str, int] = {
        "tasking-manager": 0,
        "drone-tasking-manager": 0,
        "fair": 0,
        "umap": 0,
        "imagery": 0,
    }

    async with (
        httpx.AsyncClient(timeout=90.0, verify=True) as default_client,
        httpx.AsyncClient(timeout=90.0, verify=settings.fair_verify_ssl) as fair_client,
    ):
        tm_result, drone_result, fair_result, umap_result = await asyncio.gather(
            _fetch_tasking_manager_rows(default_client),
            _fetch_dronetm_rows(default_client),
            _fetch_fair_rows(fair_client),
            _fetch_umap_rows(default_client),
            return_exceptions=True,
        )

    tm_rows = [] if isinstance(tm_result, Exception) else tm_result
    drone_rows = [] if isinstance(drone_result, Exception) else drone_result
    fair_rows = [] if isinstance(fair_result, Exception) else fair_result
    umap_rows = [] if isinstance(umap_result, Exception) else umap_result

    oam_rows = await _fetch_oam_rows_from_db(db)

    states = await _get_sync_states(db)

    tm_rows_to_upsert = tm_rows
    drone_rows_to_upsert = drone_rows
    fair_rows_to_upsert = fair_rows
    umap_rows_to_upsert = umap_rows
    oam_rows_to_upsert = _filter_rows_since_cursor(oam_rows, states.get("imagery"))

    counts["tasking-manager"] = await _upsert_product_rows(db, tm_rows_to_upsert)
    counts["drone-tasking-manager"] = await _upsert_product_rows(db, drone_rows_to_upsert)
    counts["fair"] = await _upsert_product_rows(db, fair_rows_to_upsert)
    counts["umap"] = await _upsert_product_rows(db, umap_rows_to_upsert)
    counts["imagery"] = await _upsert_product_rows(db, oam_rows_to_upsert)

    await _upsert_sync_state(db, "tasking-manager", tm_rows, states)
    await _upsert_sync_state(db, "drone-tasking-manager", drone_rows, states)
    await _upsert_sync_state(db, "fair", fair_rows, states)
    await _upsert_sync_state(db, "umap", umap_rows, states)
    await _upsert_sync_state(db, "imagery", oam_rows, states)

    await db.commit()

    return counts


async def query_map_projects(db: AsyncSession) -> dict:
    """Return all stored map projects as a GeoJSON FeatureCollection."""
    await ensure_table_exists(db)

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
    await ensure_table_exists(db)

    result = await db.execute(select(func.count(MapProject.id)))
    return (result.scalar() or 0) == 0

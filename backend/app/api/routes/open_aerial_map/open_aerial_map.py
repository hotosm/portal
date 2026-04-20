import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import DEFAULT_TTL, SHORT_TTL, get_cached, set_cached
from app.core.database import get_db
from app.models.open_aerial_map import (
    CompactSnapshotResponse,
    ImageryDetailResponse,
    ImageryListResponse,
)
from app.core.config import settings
from app.services import oam_service

OAM_API_BASE_URL = settings.oam_api_url
SYNC_INTERVAL = 7 * 24 * 60 * 60  # 1 week in seconds

router = APIRouter(prefix="/open-aerial-map")

# Background task control
_sync_task: Optional[asyncio.Task] = None


# ── Background sync scheduler ─────────────────────────────────────────────────


async def _db_sync_scheduler() -> None:
    """Background task: sync OAM data from API into DB every week."""
    from app.core.database import AsyncSessionLocal

    while True:
        try:
            async with AsyncSessionLocal() as db:
                await oam_service.sync_from_oam_api(db)
        except Exception as e:
            logger.error("OAM DB sync scheduler error: %s", e)

        await asyncio.sleep(SYNC_INTERVAL)


def start_sync_scheduler() -> None:
    """Start the weekly OAM → DB background sync task."""
    global _sync_task
    if _sync_task is None or _sync_task.done():
        _sync_task = asyncio.create_task(_db_sync_scheduler())
        logger.info("OAM DB sync scheduler started (weekly updates)")


def stop_sync_scheduler() -> None:
    """Cancel the background sync task on shutdown."""
    global _sync_task
    if _sync_task and not _sync_task.done():
        _sync_task.cancel()
        logger.info("OAM DB sync scheduler stopped")


# Keep legacy name so main.py import doesn't break during transition
start_snapshot_scheduler = start_sync_scheduler


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("/projects", response_model=ImageryListResponse)
async def get_imagery_metadata(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    page: int = Query(1, ge=1, description="Page number"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    bbox: Optional[str] = Query(None, description="Bounding box: min_lon,min_lat,max_lon,max_lat"),
    has_tiled: Optional[bool] = Query(None, description="Filter by images with tiles"),
    title: Optional[str] = Query(None, description="Search by title"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    gsd_from: Optional[float] = Query(None, description="Minimum GSD (resolution)"),
    gsd_to: Optional[float] = Query(None, description="Maximum GSD (resolution)"),
    acquisition_from: Optional[str] = Query(None, description="Acquisition date from (YYYY-MM-DD)"),
    acquisition_to: Optional[str] = Query(None, description="Acquisition date to (YYYY-MM-DD)"),
) -> dict:
    """
    Search OAM imagery from the local PostgreSQL database.

    Results come from the DB, which is synced from the OAM API on startup
    and refreshed weekly in the background.

    Example: GET /api/open-aerial-map/projects?limit=10&sort=desc
    """
    cache_key = (
        f"oam_projects_{limit}_{page}_{sort}_{bbox}_{has_tiled}_"
        f"{title}_{provider}_{gsd_from}_{gsd_to}_{acquisition_from}_{acquisition_to}"
    )
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        data = await oam_service.query_images(
            db,
            limit=limit,
            page=page,
            sort=sort,
            bbox=bbox,
            title=title,
            provider=provider,
            gsd_from=gsd_from,
            gsd_to=gsd_to,
            acquisition_from=acquisition_from,
            acquisition_to=acquisition_to,
            has_tiled=has_tiled,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    set_cached(cache_key, data, DEFAULT_TTL)
    return data


@router.get("/projects/all", response_model=CompactSnapshotResponse)
async def get_all_projects(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Return all OAM images in compact snapshot format.

    Equivalent to the old static snapshot file, but served from the DB.

    Example: GET /api/open-aerial-map/projects/all
    """
    cache_key = "oam_projects_all"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        data = await oam_service.query_all_images(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    set_cached(cache_key, data, SHORT_TTL)
    return data


@router.get("/projects/snapshot", response_model=CompactSnapshotResponse)
async def get_projects_snapshot(
    db: AsyncSession = Depends(get_db),
    refresh: bool = Query(False, description="Force sync from OAM API (slow, ~2 min)"),
) -> dict:
    """
    Get OAM snapshot stats + all imagery in compact format.

    Use refresh=true to force a full re-sync from the OAM API.

    Example: GET /api/open-aerial-map/projects/snapshot
    """
    if refresh:
        try:
            await oam_service.sync_from_oam_api(db)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sync failed: {e}")

    try:
        data = await oam_service.query_all_images(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return data


@router.get("/projects/{image_id}", response_model=ImageryDetailResponse)
async def get_imagery_by_id(
    db: AsyncSession = Depends(get_db),
    image_id: str = Path(..., description="OpenAerialMap image ID"),
) -> dict:
    """
    Get metadata for a specific image by ID.

    Looks up in the local DB first; falls back to the OAM API if not found.

    Example: GET /api/open-aerial-map/projects/59e62b863d6412ef72209ae1
    """
    cache_key = f"oam_image_{image_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    # Try local DB first
    row = await oam_service.get_image_by_id(db, image_id)
    if row is not None:
        result = {"meta": None, "results": row}
        set_cached(cache_key, result, DEFAULT_TTL)
        return result

    # Fallback: live OAM API
    url = f"{OAM_API_BASE_URL}/meta/{image_id}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/me", response_model=ImageryListResponse)
async def get_my_imagery(
    user: CurrentUser,
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    page: int = Query(1, ge=1, description="Page number"),
    order_by: str = Query("acquisition_end", description="Field to order by"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
) -> dict:
    """
    Get imagery metadata for the authenticated user from OpenAerialMap.

    Queries the OAM API filtering by the user's email address (contact field).

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie or Bearer token)

    **How it works**:
    - Uses the authenticated user's email to filter imagery
    - Searches in the OAM production API by contact field

    **Returns**:
    - 200: User's imagery from OpenAerialMap
    - 401: Not authenticated
    - 500: Error from OAM API

    Example: GET /api/open-aerial-map/user/me?limit=100
    """
    if not user.email:
        raise HTTPException(
            status_code=400,
            detail="User email not available. Cannot filter imagery without email.",
        )

    url = f"{OAM_API_BASE_URL}/meta"
    params = {
        "contact": user.email,
        "limit": limit,
        "page": page,
        "order_by": order_by,
        "sort": sort,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}", response_model=ImageryListResponse)
async def get_imagery_by_user(
    user_id: str = Path(..., description="OpenAerialMap user ID"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    page: int = Query(1, ge=1, description="Page number"),
    order_by: str = Query("acquisition_end", description="Field to order by"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
) -> dict:
    """
    Get imagery metadata for a specific user from OpenAerialMap API.

    Example: GET /api/open-aerial-map/user/6918b688d06a6f5c0a953e2e?order_by=acquisition_end&sort=desc&limit=10
    """
    url = f"{OAM_API_BASE_URL}/meta"
    params = {
        "user": user_id,
        "limit": limit,
        "page": page,
        "order_by": order_by,
        "sort": sort,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

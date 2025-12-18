# portal/backend/app/api/routes/open_aerial_map/open_aerial_map.py

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path as FilePath
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Path, Query
from starlette.responses import FileResponse

from app.models.open_aerial_map import (
    ImageryListResponse,
    ImageryDetailResponse,
    CompactSnapshotResponse,
)
from app.core.cache import get_cached, set_cached, DEFAULT_TTL, SHORT_TTL

OAM_API_BASE_URL = "https://api.openaerialmap.org"
SNAPSHOT_FILE_PATH = FilePath(__file__).parent.parent.parent.parent / "data" / "oam_snapshot.json"
SNAPSHOT_UPDATE_INTERVAL = 7 * 24 * 60 * 60  # 1 week in seconds

router = APIRouter(prefix="/open-aerial-map")

# Background task control
_snapshot_task: Optional[asyncio.Task] = None


async def fetch_all_oam_data() -> list[dict]:
    """Fetch all OAM data with limit=99999."""
    url = f"{OAM_API_BASE_URL}/meta"
    params = {"limit": 99999, "sort": "desc"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("results", [])


def convert_to_compact(results: list[dict]) -> list[dict]:
    """Convert full results to compact format for minimal storage."""
    compact_results = []
    for item in results:
        props = item.get("properties", {}) or {}
        compact = {
            "_id": item.get("_id"),
            "t": item.get("title"),
            "bbox": item.get("bbox"),
            "gsd": item.get("gsd"),
            "acq": item.get("acquisition_end"),
            "prov": item.get("provider"),
            "tms": props.get("tms"),
            "th": props.get("thumbnail"),
        }
        # Remove None values to save space
        compact_results.append({k: v for k, v in compact.items() if v is not None})
    return compact_results


async def generate_snapshot() -> CompactSnapshotResponse:
    """Generate and save OAM snapshot to file."""
    print("📸 Starting OAM snapshot generation...")

    try:
        results = await fetch_all_oam_data()
        compact_results = convert_to_compact(results)

        snapshot_data = {
            "count": len(compact_results),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "results": compact_results,
        }

        # Ensure directory exists
        SNAPSHOT_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)

        # Write with minimal whitespace for size optimization
        with open(SNAPSHOT_FILE_PATH, "w") as f:
            json.dump(snapshot_data, f, separators=(",", ":"))

        file_size_mb = SNAPSHOT_FILE_PATH.stat().st_size / (1024 * 1024)
        print(f"✅ OAM snapshot saved: {len(compact_results)} items, {file_size_mb:.2f} MB")

        return CompactSnapshotResponse(**snapshot_data)
    except Exception as e:
        print(f"❌ OAM snapshot generation failed: {e}")
        raise


async def snapshot_scheduler():
    """Background task that updates snapshot weekly."""
    while True:
        try:
            await generate_snapshot()
        except Exception as e:
            print(f"⚠️ Snapshot scheduler error: {e}")

        # Wait one week before next update
        await asyncio.sleep(SNAPSHOT_UPDATE_INTERVAL)


def start_snapshot_scheduler():
    """Start the background snapshot scheduler."""
    global _snapshot_task
    if _snapshot_task is None or _snapshot_task.done():
        _snapshot_task = asyncio.create_task(snapshot_scheduler())
        print("🕐 OAM snapshot scheduler started (weekly updates)")


def stop_snapshot_scheduler():
    """Stop the background snapshot scheduler."""
    global _snapshot_task
    if _snapshot_task and not _snapshot_task.done():
        _snapshot_task.cancel()
        print("🛑 OAM snapshot scheduler stopped")

@router.get("/projects", response_model=ImageryListResponse)
async def get_imagery_metadata(
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
    Get imagery metadata from OpenAerialMap API.
    
    Example: GET /api/open-aerial-map/projects?limit=10&sort=desc
    """
    url = f"{OAM_API_BASE_URL}/meta"
    
    params = {
        "limit": limit,
        "page": page,
        "sort": sort,
    }
    
    # Add optional parameters only if present
    if bbox:
        params["bbox"] = bbox
    if has_tiled is not None:
        params["has_tiled"] = str(has_tiled).lower()
    if title:
        params["title"] = title
    if provider:
        params["provider"] = provider
    if gsd_from is not None:
        params["gsd_from"] = gsd_from
    if gsd_to is not None:
        params["gsd_to"] = gsd_to
    if acquisition_from:
        params["acquisition_from"] = acquisition_from
    if acquisition_to:
        params["acquisition_to"] = acquisition_to
    
    # Cache key based on parameters
    cache_key = f"oam_projects_{limit}_{page}_{sort}_{bbox}_{has_tiled}_{title}_{provider}_{gsd_from}_{gsd_to}_{acquisition_from}_{acquisition_to}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/all")
async def get_all_projects():
    """
    Serve OAM snapshot file directly - instant response.

    Returns the pre-generated snapshot as a static file stream.
    No JSON parsing, maximum performance.

    Example: GET /api/open-aerial-map/projects/all
    """
    if not SNAPSHOT_FILE_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Snapshot not found. It will be generated shortly."
        )

    return FileResponse(
        path=SNAPSHOT_FILE_PATH,
        media_type="application/json",
        filename="oam_snapshot.json",
    )


@router.get("/projects/snapshot", response_model=CompactSnapshotResponse)
async def get_projects_snapshot(
    refresh: bool = Query(False, description="Force refresh the snapshot"),
) -> dict:
    """
    Get cached OAM snapshot from local file.

    This endpoint serves a pre-generated compact snapshot of all OAM imagery.
    The snapshot is automatically updated weekly in the background.

    Use refresh=true to force regenerate the snapshot (slow, ~2 min).

    Example: GET /api/open-aerial-map/projects/snapshot
    """
    if refresh:
        snapshot = await generate_snapshot()
        return snapshot.model_dump()

    # Try to read from file
    if SNAPSHOT_FILE_PATH.exists():
        try:
            with open(SNAPSHOT_FILE_PATH, "r") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error reading snapshot file: {e}"
            )

    # No snapshot exists, generate one
    snapshot = await generate_snapshot()
    return snapshot.model_dump()


@router.get("/projects/{image_id}", response_model=ImageryDetailResponse)
async def get_imagery_by_id(
    image_id: str = Path(..., description="OpenAerialMap image ID")
) -> dict:
    """
    Get metadata for a specific image by ID.

    Example: GET /api/open-aerial-map/projects/59e62b863d6412ef72209ae1
    """
    cache_key = f"oam_image_{image_id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

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
                detail=f"Error from OpenAerialMap API: {e.response.text}"
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
                detail=f"Error from OpenAerialMap API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
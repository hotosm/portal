# portal/backend/app/api/routes/export_tool/export_tool.py

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional
from app.models.export_tool import ExportJobsResponse
from app.core.cache import get_cached, set_cached, DEFAULT_TTL, SHORT_TTL
from app.core.config import settings
from app.core.database import get_db
from app.services import export_tool_service, plans_service
from app.services.exceptions import UpstreamUnavailable

EXPORT_TOOL_API_BASE_URL = settings.export_tool_api_url

router = APIRouter(prefix="/export-tool")


@router.get("/jobs", response_model=ExportJobsResponse)
async def get_export_jobs(
    auth_user: CurrentUserOptional = None,
    db: AsyncSession = Depends(get_db),
    pinned: bool = Query(True, description="Filter pinned jobs"),
    all: bool = Query(True, description="Get all jobs"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search term for job name or description"),
    status: Optional[str] = Query(None, description="Filter by job status (COMPLETED, RUNNING, PENDING, etc.)"),
    user: Optional[str] = Query(None, description="Filter by user ID"),
    region: Optional[str] = Query(None, description="Filter by region"),
) -> dict:
    """
    Get export jobs from HOT Export Tool API.

    Example: GET /api/export-tool/jobs?pinned=true&all=true&limit=20&offset=0
    """
    cache_key = f"export_jobs_{pinned}_{all}_{limit}_{offset}_{search}_{status}_{user}_{region}"

    async def enrich(payload: dict) -> dict:
        results = payload.get("results") or []
        owner_id = auth_user.id if auth_user is not None else None
        enriched = await plans_service.enrich_items_with_plans(
            db, owner_id, "export-tool", results, "uid"
        )
        return {**payload, "results": enriched}

    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return await enrich(cached_data)

    url = f"{EXPORT_TOOL_API_BASE_URL}/jobs"

    params = {
        "pinned": str(pinned).lower(),
        "all": str(all).lower(),
        "limit": limit,
        "offset": offset,
    }

    # Add optional parameters only if present
    if search:
        params["search"] = search
    if status:
        params["status"] = status
    if user:
        params["user"] = user
    if region:
        params["region"] = region

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, SHORT_TTL)  # Short TTL for jobs (status changes frequently)
            return await enrich(data)
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from HOT Export Tool API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/me")
async def get_my_export_jobs(
    request: Request,
    user: CurrentUser,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search term for job name or description"),
    status: Optional[str] = Query(None, description="Filter by job status (COMPLETED, RUNNING, PENDING, etc.)"),
) -> dict:
    """
    Get export jobs belonging to the currently authenticated user.

    Forwards the Hanko auth cookie to the Export Tool API, which filters
    jobs by the authenticated user when all=false (default).
    """
    hanko_cookie = request.cookies.get("hanko")
    if not hanko_cookie:
        raise HTTPException(status_code=401, detail="Hanko auth cookie not found")

    url = f"{EXPORT_TOOL_API_BASE_URL}/jobs"

    params = {
        "all": "false",
        "limit": limit,
        "offset": offset,
    }

    if search:
        params["search"] = search
    if status:
        params["status"] = status

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                url,
                params=params,
                cookies={"hanko": hanko_cookie},
            )
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Export Tool API timed out")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from HOT Export Tool API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_uid}")
async def get_export_job_detail(
    job_uid: str
) -> dict:
    """
    Get detailed information for a specific export job.

    Example: GET /api/export-tool/jobs/18086728-c32d-4a52-afa0-1ca15b7df380
    """
    try:
        result = await export_tool_service.fetch_job_by_uid(job_uid)
    except UpstreamUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    if result is None:
        raise HTTPException(status_code=404, detail=f"Export job {job_uid} not found")
    return result

import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.export_tool import ExportJobsResponse

EXPORT_TOOL_API_BASE_URL = "https://export.hotosm.org/api"

router = APIRouter(prefix="/export-tool")

@router.get("/jobs", response_model=ExportJobsResponse)
async def get_export_jobs(
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
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from HOT Export Tool API: {e.response.text}"
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
    url = f"{EXPORT_TOOL_API_BASE_URL}/jobs/{job_uid}"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from HOT Export Tool API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
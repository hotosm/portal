# portal/backend/app/api/routes/user/export_tool.py

import httpx
from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional
from hotosm_auth_fastapi import CurrentUser
from app.core.config import settings

EXPORT_TOOL_API_BASE_URL = settings.export_tool_api_url

router = APIRouter(prefix="/export-tool")


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

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                url,
                params=params,
                cookies={"hanko": hanko_cookie},
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from HOT Export Tool API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

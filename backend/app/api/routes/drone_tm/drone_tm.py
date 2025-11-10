import httpx
from fastapi import APIRouter, HTTPException, Path
from typing import Optional

HOTOSM_API_BASE_URL = "https://dronetm.org/api"

# Enter the access token in DRONETM_TOKEN
DRONETM_TOKEN = ""

router = APIRouter(prefix="/drone-tm")

@router.get("/projects")
async def get_projects(
    filter_by_owner: Optional[bool] = False,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    results_per_page: int = 20
):
    """
    Proxy a DroneTM API
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/"
    
    params = {
        "filter_by_owner": str(filter_by_owner).lower(),
        "page": page,
        "results_per_page": results_per_page,
    }
    if status:
        params["status"] = status
    if search:
        params["search"] = search
    
    headers = {
        "access-token": DRONETM_TOKEN,
        "Accept": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        

@router.get("/projects/{project_id}")
async def get_project_by_id(
    project_id: str = Path(..., description="DroneTM project ID (UUID or number)")
):
    """
    Get a specific project from the DroneTM API.
    Example: GET /api/drone-tm/projects/5c92d0c5-1702-4ebd-b885-67867b488e8e
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}"
    headers = {
        "access-token": DRONETM_TOKEN,
        "Accept": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
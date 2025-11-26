import httpx
from fastapi import APIRouter, HTTPException, Path, Request
from typing import Optional

from hotosm_auth.integrations.fastapi import CurrentUser
from app.models.drone_tm import DroneTMProjectsResponse, DroneTMProject

HOTOSM_API_BASE_URL = "https://dronetm.hotosm.test/api"

router = APIRouter(prefix="/drone-tm")

@router.get("/projects", response_model=DroneTMProjectsResponse)
async def get_projects(
    user: CurrentUser,
    filter_by_owner: Optional[bool] = False,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    results_per_page: int = 20,
    fetch_all: Optional[bool] = False
) -> dict:
    """
    Proxy to DroneTM API with JWT authentication (CurrentUser).
    The user's JWT is sent as an "access-token" to DroneTM.
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/"

    headers = {
        "access-token": user.access_token, 
        "Accept": "application/json",
    }

    jwt = await call_next(request)
    async with httpx.AsyncClient() as client:
        try:
            if not fetch_all:
                params = jwt + {
                    "filter_by_owner": str(filter_by_owner).lower(),
                    "page": page,
                    "results_per_page": results_per_page,
                }
                if status:
                    params["status"] = status
                if search:
                    params["search"] = search

                response = await client.get(url, headers=headers, params=params)

                response.raise_for_status()
                return jwt + response.json()

            else:
                all_results = []
                current_page = 1
                total_pages = None

                while True:
                    params = {
                        "filter_by_owner": str(filter_by_owner).lower(),
                        "page": current_page,
                        "results_per_page": results_per_page,
                    }
                    if status:
                        params["status"] = status
                    if search:
                        params["search"] = search

                    response = await client.get(url, headers=headers, params=params)
                    response.raise_for_status()
                    data = response.json()

                    all_results.extend(data.get("results", []))

                    pagination = data.get("pagination", {})
                    total_pages = pagination.get("total_pages", 1)

                    if current_page >= total_pages:
                        break

                    current_page += 1

                return jwt + {
                    "results": all_results,
                    "pagination": {
                        "page": 1,
                        "results_per_page": len(all_results),
                        "total_pages": 1,
                        "total": len(all_results)
                    }
                }

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}", response_model=DroneTMProject)
async def get_project_by_id(
    user: CurrentUser,
    project_id: str = Path(..., description="DroneTM project ID (UUID or number)")
) -> dict:
    """
    Obtain a specific DroneTM project using the user's JWT.
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}"

    headers = {
        "access-token": user.access_token,
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
                detail=f"Error from DroneTM API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

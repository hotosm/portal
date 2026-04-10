# portal/backend/app/api/routes/map/drone_tasking_manager.py

import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Path

from app.models.drone_tasking_manager import DroneTMCentroidsResponse, DroneTMProject
from app.core.cache import get_cached, set_cached, DEFAULT_TTL
from app.core.config import settings
from app.api.routes.shared.drone_tm_helpers import (
    DRONE_TM_BACKEND_URL,
    build_dronetm_cache_key,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/drone-tasking-manager")


@router.get("/projects/centroids", response_model=DroneTMCentroidsResponse)
async def get_projects_centroids(
    filter_by_owner: Optional[bool] = False,
    search: Optional[str] = None,
    page: int = 1,
    results_per_page: int = 12,
) -> dict:
    """
    Get project centroids from DroneTM Production API (public endpoint, no auth required).

    Returns a list of projects with their geographic centroids (GeoJSON Points).
    Useful for displaying projects on a map.

    Args:
        filter_by_owner: Filter projects by owner
        search: Search query
        page: Page number
        results_per_page: Results per page (default: 12)

    Example: GET /api/drone-tasking-manager/projects/centroids?page=1&results_per_page=12&search=test

    Response:
    ```json
        {
            "results": [
                {
                    "id": "uuid",
                    "slug": "project-slug",
                    "name": "Project Name",
                    "centroid": {
                        "type": "Point",
                        "coordinates": [longitude, latitude]
                    },
                    "total_task_count": 10,
                    "ongoing_task_count": 5,
                    "completed_task_count": 3,
                    "status": "ongoing"
                }
            ],
            "pagination": {...}
        }
    ```
    """
    cache_key = build_dronetm_cache_key(filter_by_owner, search, page, results_per_page)
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    # Use configured backend URL for public centroids endpoint
    url = f"{DRONE_TM_BACKEND_URL}/projects/centroids"

    logger.info(f"[Centroids] Target URL: {url}")

    headers = {
        "Accept": "application/json",
    }

    params = {
        "filter_by_owner": str(filter_by_owner).lower(),
        "page": page,
        "results_per_page": results_per_page,
    }
    if search:
        params["search"] = search

    verify_ssl = not DRONE_TM_BACKEND_URL.startswith("https://") or settings.drone_tm_verify_ssl

    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            logger.info(f"[Centroids] Making request to {url} with params: {params}")
            response = await client.get(url, headers=headers, params=params)
            logger.info(f"[Centroids] Response status: {response.status_code}")
            response.raise_for_status()

            # The API returns an array, wrap it in our response format
            data = response.json()

            # If the response is an array, wrap it in our expected format
            if isinstance(data, list):
                result = {
                    "results": data,
                    "pagination": {
                        "page": page,
                        "per_page": results_per_page,
                        "total": len(data),
                    }
                }
            else:
                result = data

            set_cached(cache_key, result, DEFAULT_TTL)
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except httpx.TimeoutException:
            logger.error("Request timeout")
            raise HTTPException(
                status_code=504,
                detail="Request to DroneTM API timed out"
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}", response_model=DroneTMProject)
async def get_project_by_id(
    project_id: str = Path(..., description="DroneTM project ID (UUID or number)")
) -> dict:
    """
    Get a specific project from DroneTM Production API (public endpoint, no auth required).

    Example: GET /api/drone-tasking-manager/projects/5c92d0c5-1702-4ebd-b885-67867b488e8e

    Response:
    ```json
        {
            "id": "5c92d0c5-1702-4ebd-b885-67867b488e8e",
            "name": "RG Quarry",
            "description": "...",
            ...
        }
    ```
    """
    cache_key = f"dronetm_project_{project_id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    # Use configured backend URL for public project details endpoint
    url = f"{DRONE_TM_BACKEND_URL}/projects/{project_id}"

    headers = {
        "Accept": "application/json",
    }

    verify_ssl = not DRONE_TM_BACKEND_URL.startswith("https://") or settings.drone_tm_verify_ssl

    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"DroneTM project '{project_id}' not found"
                )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Request to DroneTM API timed out"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

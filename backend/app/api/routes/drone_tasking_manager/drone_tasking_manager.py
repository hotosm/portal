# portal/backend/app/api/routes/drone_tasking_manager/drone_tasking_manager.py

import httpx
from fastapi import APIRouter, HTTPException, Path, Request
from typing import Optional
from app.models.drone_tasking_manager import (
    DroneTMProjectsResponse,
    DroneTMProject,
    DroneTMCentroidsResponse,
)

import os
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Configurable via environment variable
# For Docker internal: use service name (e.g., "http://dronetm-backend:8000/api")
# For external access: use public URL (e.g., "https://dronetm.hotosm.test/api")
DRONE_TM_BACKEND_URL = os.getenv("DRONE_TM_BACKEND_URL", "http://hotosm-dronetm-backend:8000/api")
HOTOSM_API_BASE_URL = DRONE_TM_BACKEND_URL

logger.info(f"🚁 Drone-TM Backend URL: {HOTOSM_API_BASE_URL}")

router = APIRouter(prefix="/drone-tasking-manager")

@router.get("/projects", response_model=DroneTMProjectsResponse)
async def get_projects(
    request: Request,
    filter_by_owner: Optional[bool] = False,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    results_per_page: int = 20,
    fetch_all: Optional[bool] = False
) -> dict:
    """
    Proxy to DroneTM API with Hanko authentication.
    
    This endpoint forwards the Hanko authentication cookie to the DroneTM API.
    
    Args:
        request: FastAPI request object (to access cookies)
        filter_by_owner: Filter projects by owner
        status: Filter by project status
        search: Search query
        page: Page number
        results_per_page: Results per page
        fetch_all: If True, fetch all projects from all pages
    
    Response:
    ```json
        {
            "results": [...],
            "pagination": {...}
        }
    ```
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/"
    
    # Extract Hanko cookie from the incoming request
    # The cookie name might be "hanko" or another name depending on your setup
    hanko_cookie = request.cookies.get("hanko")
    
    logger.info(f"🍪 Hanko cookie present: {bool(hanko_cookie)}")
    logger.info(f"🌐 Target URL: {url}")
    
    if not hanko_cookie:
        logger.warning("❌ No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in."
        )
    
    # Forward the Hanko cookie to DroneTM API
    # The DroneTM API expects the cookie in the Cookie header
    headers = {
        "Cookie": f"hanko={hanko_cookie}",
        "Accept": "application/json",
    }
    
    # If using HTTPS with self-signed certificates in Docker, disable verification
    # In production with valid certs, set verify=True
    verify_ssl = not HOTOSM_API_BASE_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"
    
    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            if not fetch_all:
                params = {
                    "filter_by_owner": str(filter_by_owner).lower(),
                    "page": page,
                    "results_per_page": results_per_page,
                }
                if status:
                    params["status"] = status
                if search:
                    params["search"] = search
                
                logger.info(f"📡 Making request to {url} with params: {params}")
                response = await client.get(url, headers=headers, params=params)
                logger.info(f"✅ Response status: {response.status_code}")
                response.raise_for_status()
                return response.json()
            
            else:
                # Fetch all pages
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
                
                return {
                    "results": all_results,
                    "pagination": {
                        "page": 1,
                        "results_per_page": len(all_results),
                        "total_pages": 1,
                        "total": len(all_results)
                    }
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except httpx.TimeoutException:
            logger.error("❌ Request timeout")
            raise HTTPException(
                status_code=504,
                detail="Request to DroneTM API timed out"
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/centroids", response_model=DroneTMCentroidsResponse)
async def get_projects_centroids(
    filter_by_owner: Optional[bool] = False,
    search: Optional[str] = None,
    page: int = 1,
    results_per_page: int = 12,
) -> dict:
    """
    Get project centroids from the DroneTM API (public endpoint, no auth required).

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
    url = f"{HOTOSM_API_BASE_URL}/projects/centroids"

    logger.info(f"🌐 [Centroids] Target URL: {url}")

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

    verify_ssl = not HOTOSM_API_BASE_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"

    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            logger.info(f"📡 [Centroids] Making request to {url} with params: {params}")
            response = await client.get(url, headers=headers, params=params)
            logger.info(f"✅ [Centroids] Response status: {response.status_code}")
            response.raise_for_status()

            # The API returns an array, wrap it in our response format
            data = response.json()

            # If the response is an array, wrap it in our expected format
            if isinstance(data, list):
                return {
                    "results": data,
                    "pagination": {
                        "page": page,
                        "per_page": results_per_page,
                        "total": len(data),
                    }
                }

            # If it already has the expected format, return as-is
            return data

        except httpx.HTTPStatusError as e:
            logger.error(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except httpx.TimeoutException:
            logger.error("❌ Request timeout")
            raise HTTPException(
                status_code=504,
                detail="Request to DroneTM API timed out"
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/user", response_model=DroneTMProjectsResponse)
async def get_user_projects(
    request: Request,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    results_per_page: int = 12,
) -> dict:
    """
    Get projects filtered by the current authenticated user (filter_by_owner=true).
    
    This is a convenience endpoint that always filters by owner.
    
    Args:
        request: FastAPI request object (to access cookies)
        status: Filter by project status
        search: Search query
        page: Page number
        results_per_page: Results per page (default: 12)
    
    Example: GET /api/drone-tasking-manager/projects/user?page=1&results_per_page=12&search=test
    
    Response:
    ```json
        {
            "results": [...],
            "pagination": {...}
        }
    ```
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/"
    
    # Extract Hanko cookie from the incoming request
    hanko_cookie = request.cookies.get("hanko")
    
    logger.info(f"🍪 [User Projects] Hanko cookie present: {bool(hanko_cookie)}")
    logger.info(f"🌐 [User Projects] Target URL: {url}")
    
    if not hanko_cookie:
        logger.warning("❌ No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in."
        )
    
    # Forward the Hanko cookie to DroneTM API
    headers = {
        "Cookie": f"hanko={hanko_cookie}",
        "Accept": "application/json",
    }
    
    # Always filter by owner for this endpoint
    params = {
        "filter_by_owner": "true",
        "page": page,
        "results_per_page": results_per_page,
    }
    if status:
        params["status"] = status
    if search:
        params["search"] = search
    
    verify_ssl = not HOTOSM_API_BASE_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"
    
    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            logger.info(f"📡 [User Projects] Making request to {url} with params: {params}")
            response = await client.get(url, headers=headers, params=params)
            logger.info(f"✅ [User Projects] Response status: {response.status_code}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from DroneTM API: {e.response.text}"
            )
        except httpx.TimeoutException:
            logger.error("❌ Request timeout")
            raise HTTPException(
                status_code=504,
                detail="Request to DroneTM API timed out"
            )
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}", response_model=DroneTMProject)
async def get_project_by_id(
    request: Request,
    project_id: str = Path(..., description="DroneTM project ID (UUID or number)")
) -> dict:
    """
    Get a specific project from the DroneTM API with Hanko authentication.
    
    Example: GET /api/drone-tm/projects/5c92d0c5-1702-4ebd-b885-67867b488e8e
    
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
    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}"
    
    # Extract Hanko cookie from the incoming request
    hanko_cookie = request.cookies.get("hanko")
    
    if not hanko_cookie:
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in."
        )
    
    headers = {
        "Cookie": f"hanko={hanko_cookie}",
        "Accept": "application/json",
    }
    
    # If using HTTPS with self-signed certificates in Docker, disable verification
    # In production with valid certs, set verify=True
    verify_ssl = not HOTOSM_API_BASE_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"

    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
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
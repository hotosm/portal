# portal/backend/app/api/routes/drone_tasking_manager/drone_tasking_manager.py

import httpx
from fastapi import APIRouter, HTTPException, Path, Request
from typing import Optional
from app.models.drone_tasking_manager import (
    DroneTMProjectsResponse,
    DroneTMProject,
    DroneTMCentroidsResponse,
)
from app.core.cache import get_cached, set_cached, DEFAULT_TTL, SHORT_TTL

import os
import logging
import json
import base64

# Setup logging
logger = logging.getLogger(__name__)

# Drone-TM API Configuration
# Configure via DRONE_TM_BACKEND_URL environment variable:
# - Production: "https://dronetm.org/api"
# - Test (Hanko-backed): "https://testlogin.dronetm.hotosm.org/api"
# - Local (Hanko-backed): "https://dronetm.hotosm.test/api"
DRONE_TM_DEFAULT_URL = "https://dronetm.org/api"
DRONE_TM_BACKEND_URL = os.getenv("DRONE_TM_BACKEND_URL", DRONE_TM_DEFAULT_URL)

# Auth header configuration for private Drone-TM endpoints
# Some Drone-TM private endpoints changed auth from basic auth to header-based tokens.
# The portal will forward the Hanko session token (cookie) as an authentication header
# to the Drone-TM backend. Configure the header name/prefix via env vars if needed.
DRONE_TM_AUTH_HEADER = os.getenv("DRONE_TM_AUTH_HEADER", "Authorization")
DRONE_TM_AUTH_PREFIX = os.getenv("DRONE_TM_AUTH_PREFIX", "Bearer")

logger.info(f"🚁 Drone-TM Backend URL: {DRONE_TM_BACKEND_URL}")

router = APIRouter(prefix="/drone-tasking-manager")


def _extract_hanko_user_id_from_token(token: str) -> Optional[str]:
    """Try to decode a JWT-like token and extract a user id (sub or hanko_user_id).

    This does a unsigned decode (no verification) and is only used to pass an
    identifier upstream for matching Portal users to DroneTM test instances.
    """
    try:
        parts = token.split('.')
        if len(parts) < 2:
            return None
        payload = parts[1]
        # Fix padding
        padding = '=' * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload + padding).decode('utf-8')
        data = json.loads(decoded)
        return data.get('sub') or data.get('hanko_user_id') or data.get('user_id')
    except Exception:
        return None

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
    url = f"{DRONE_TM_BACKEND_URL}/projects/"
    
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
    
    # Build headers for private DroneTM endpoints.
    # Recent DroneTM test instances require header-based token auth (not HTTP Basic)
    # Forward the raw Hanko session token in the configured auth header
    # (e.g. `Authorization: Bearer <token>`). Also include an identifier header
    # with the Hanko user id extracted from the token so DroneTM can match users.
    headers = {
        "Accept": "application/json",
    }

    # Forward token as configured auth header (default: Authorization: Bearer)
    try:
        auth_value = f"{DRONE_TM_AUTH_PREFIX} {hanko_cookie}"
        headers[DRONE_TM_AUTH_HEADER] = auth_value
    except Exception:
        # Fallback: do not set auth header if something goes wrong
        logger.warning("Failed to set DroneTM auth header from Hanko cookie")

    # Add an extra header with the Hanko user id (if we can extract it)
    hanko_user_id = _extract_hanko_user_id_from_token(hanko_cookie)
    if hanko_user_id:
        headers["X-Hanko-User-Id"] = hanko_user_id
    
    # If using HTTPS with self-signed certificates in Docker, disable verification
    # In production with valid certs, set verify=True
    verify_ssl = not DRONE_TM_BACKEND_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"
    
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
    # Cache key based on parameters
    cache_key = f"dronetm_centroids_{filter_by_owner}_{search}_{page}_{results_per_page}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    # Use configured backend URL for public centroids endpoint
    url = f"{DRONE_TM_BACKEND_URL}/projects/centroids"

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

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            logger.info(f"📡 [Centroids] Making request to {url} with params: {params}")
            response = await client.get(url, headers=headers, params=params)
            logger.info(f"✅ [Centroids] Response status: {response.status_code}")
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
    url = f"{DRONE_TM_BACKEND_URL}/projects/"
    
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
    
    # Build headers for private DroneTM endpoints (always filter by owner).
    headers = {
        "Accept": "application/json",
    }

    # Forward token as configured auth header (default: Authorization: Bearer)
    try:
        auth_value = f"{DRONE_TM_AUTH_PREFIX} {hanko_cookie}"
        headers[DRONE_TM_AUTH_HEADER] = auth_value
    except Exception:
        logger.warning("Failed to set DroneTM auth header from Hanko cookie")

    # Include extracted Hanko user id to help DroneTM match the Portal user
    hanko_user_id = _extract_hanko_user_id_from_token(hanko_cookie)
    if hanko_user_id:
        headers["X-Hanko-User-Id"] = hanko_user_id
    
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
    
    verify_ssl = not DRONE_TM_BACKEND_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"
    
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

    async with httpx.AsyncClient(timeout=30.0) as client:
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
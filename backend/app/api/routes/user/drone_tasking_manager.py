# portal/backend/app/api/routes/user/drone_tasking_manager.py

import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Request

from app.models.drone_tasking_manager import DroneTMProjectsResponse
from app.core.config import settings
from app.api.routes.shared.drone_tm_helpers import (
    DRONE_TM_BACKEND_URL,
    DRONE_TM_AUTH_HEADER,
    DRONE_TM_AUTH_PREFIX,
    _extract_hanko_user_id_from_token,
)

logger = logging.getLogger(__name__)

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
    url = f"{DRONE_TM_BACKEND_URL}/projects/"

    # Extract Hanko cookie from the incoming request
    hanko_cookie = request.cookies.get("hanko")

    logger.info(f"Hanko cookie present: {bool(hanko_cookie)}")
    logger.info(f"Target URL: {url}")

    if not hanko_cookie:
        logger.warning("No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in."
        )

    # Build headers for private DroneTM endpoints.
    headers = {
        "Accept": "application/json",
    }

    # Forward token as configured auth header (default: Authorization: Bearer)
    try:
        auth_value = f"{DRONE_TM_AUTH_PREFIX} {hanko_cookie}"
        headers[DRONE_TM_AUTH_HEADER] = auth_value
    except Exception:
        logger.warning("Failed to set DroneTM auth header from Hanko cookie")

    # Add an extra header with the Hanko user id (if we can extract it)
    hanko_user_id = _extract_hanko_user_id_from_token(hanko_cookie)
    if hanko_user_id:
        headers["X-Hanko-User-Id"] = hanko_user_id

    verify_ssl = not DRONE_TM_BACKEND_URL.startswith("https://") or settings.drone_tm_verify_ssl

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

                logger.info(f"Making request to {url} with params: {params}")
                response = await client.get(url, headers=headers, params=params)
                logger.info(f"Response status: {response.status_code}")
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

    logger.info(f"[User Projects] Hanko cookie present: {bool(hanko_cookie)}")
    logger.info(f"[User Projects] Target URL: {url}")

    if not hanko_cookie:
        logger.warning("No Hanko cookie found in request")
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

    verify_ssl = not DRONE_TM_BACKEND_URL.startswith("https://") or settings.drone_tm_verify_ssl

    async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as client:
        try:
            logger.info(f"[User Projects] Making request to {url} with params: {params}")
            response = await client.get(url, headers=headers, params=params)
            logger.info(f"[User Projects] Response status: {response.status_code}")
            response.raise_for_status()
            return response.json()
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

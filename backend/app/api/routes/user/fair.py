# portal/backend/app/api/routes/user/fair.py

import httpx
from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional
from hotosm_auth_fastapi import CurrentUser
from app.models.fair import FAIRProjectsResponse
from app.api.routes.shared.fair_helpers import FAIR_API_BASE_URL, FAIR_VERIFY_SSL

router = APIRouter(prefix="/fair")


@router.get("/me/models", response_model=FAIRProjectsResponse)
async def get_my_fair_models(
    request: Request,
    user: CurrentUser,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search query"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by model ID"),
) -> dict:
    """
    Get AI models from fAIr API for the authenticated user.

    Forwards Hanko cookie to fAIr API for authentication.
    fAIr will auto-filter by the authenticated user.

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie)

    **Returns**:
    - 200: User's models
    - 401: Not authenticated

    Example: GET /api/fair/me/models?limit=20&ordering=-created_at
    """
    # No cache for authenticated user endpoints - data is user-specific
    url = f"{FAIR_API_BASE_URL}/model/"

    params = {
        "limit": limit,
        "offset": offset,
        "mine": "true",  # Request user-specific filtering
    }

    if search is not None:
        params["search"] = search
    if ordering:
        params["ordering"] = ordering
    if id is not None:
        params["id"] = id

    # Forward hanko cookie for fAIr authentication
    hanko_cookie = request.cookies.get("hanko")
    headers = {
        "accept": "application/json",
    }
    if hanko_cookie:
        headers["Cookie"] = f"hanko={hanko_cookie}"

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from fAIr API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/datasets")
async def get_my_fair_datasets(
    request: Request,
    user: CurrentUser,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by dataset ID"),
) -> dict:
    """
    Get datasets from fAIr API for the authenticated user.

    Forwards Hanko cookie to fAIr API for authentication.
    fAIr will auto-filter by the authenticated user.

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie)

    **Returns**:
    - 200: User's datasets
    - 401: Not authenticated

    Example: GET /api/fair/me/datasets?limit=20&ordering=-created_at
    """
    # No cache for authenticated user endpoints - data is user-specific
    url = f"{FAIR_API_BASE_URL}/dataset/"

    params = {
        "limit": limit,
        "offset": offset,
        "ordering": ordering if ordering else "-created_at",
        "mine": "true",  # Request user-specific filtering
    }

    if id is not None:
        params["id"] = id

    # Forward hanko cookie for fAIr authentication
    hanko_cookie = request.cookies.get("hanko")
    headers = {
        "accept": "application/json",
    }
    if hanko_cookie:
        headers["Cookie"] = f"hanko={hanko_cookie}"

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from fAIr API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

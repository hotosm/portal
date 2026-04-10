import httpx
from fastapi import APIRouter, HTTPException, Query
from hotosm_auth_fastapi import CurrentUser

from app.models.open_aerial_map import ImageryListResponse
from app.core.config import settings

OAM_API_BASE_URL = settings.oam_api_url

router = APIRouter(prefix="/open-aerial-map")


@router.get("/user/me", response_model=ImageryListResponse)
async def get_my_imagery(
    user: CurrentUser,
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    page: int = Query(1, ge=1, description="Page number"),
    order_by: str = Query("acquisition_end", description="Field to order by"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
) -> dict:
    """
    Get imagery metadata for the authenticated user from OpenAerialMap.

    Queries the OAM API filtering by the user's email address (contact field).

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie or Bearer token)

    **How it works**:
    - Uses the authenticated user's email to filter imagery
    - Searches in the OAM production API by contact field

    **Returns**:
    - 200: User's imagery from OpenAerialMap
    - 401: Not authenticated
    - 500: Error from OAM API

    Example: GET /api/open-aerial-map/user/me?limit=100
    """
    if not user.email:
        raise HTTPException(
            status_code=400,
            detail="User email not available. Cannot filter imagery without email.",
        )

    url = f"{OAM_API_BASE_URL}/meta"
    params = {
        "contact": user.email,
        "limit": limit,
        "page": page,
        "order_by": order_by,
        "sort": sort,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

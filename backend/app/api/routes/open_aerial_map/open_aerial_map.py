# portal/backend/app/api/routes/open_aerial_map/open_aerial_map.py

import httpx
from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional
from app.models.open_aerial_map import ImageryListResponse, ImageryDetailResponse

OAM_API_BASE_URL = "https://api.openaerialmap.org"

router = APIRouter(prefix="/open-aerial-map")

@router.get("/projects", response_model=ImageryListResponse)
async def get_imagery_metadata(
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    page: int = Query(1, ge=1, description="Page number"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    bbox: Optional[str] = Query(None, description="Bounding box: min_lon,min_lat,max_lon,max_lat"),
    has_tiled: Optional[bool] = Query(None, description="Filter by images with tiles"),
    title: Optional[str] = Query(None, description="Search by title"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    gsd_from: Optional[float] = Query(None, description="Minimum GSD (resolution)"),
    gsd_to: Optional[float] = Query(None, description="Maximum GSD (resolution)"),
    acquisition_from: Optional[str] = Query(None, description="Acquisition date from (YYYY-MM-DD)"),
    acquisition_to: Optional[str] = Query(None, description="Acquisition date to (YYYY-MM-DD)"),
) -> dict:
    """
    Get imagery metadata from OpenAerialMap API.
    
    Example: GET /api/open-aerial-map/projects?limit=10&sort=desc
    """
    url = f"{OAM_API_BASE_URL}/meta"
    
    params = {
        "limit": limit,
        "page": page,
        "sort": sort,
    }
    
    # Add optional parameters only if present
    if bbox:
        params["bbox"] = bbox
    if has_tiled is not None:
        params["has_tiled"] = str(has_tiled).lower()
    if title:
        params["title"] = title
    if provider:
        params["provider"] = provider
    if gsd_from is not None:
        params["gsd_from"] = gsd_from
    if gsd_to is not None:
        params["gsd_to"] = gsd_to
    if acquisition_from:
        params["acquisition_from"] = acquisition_from
    if acquisition_to:
        params["acquisition_to"] = acquisition_to
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{image_id}", response_model=ImageryDetailResponse)
async def get_imagery_by_id(
    image_id: str = Path(..., description="OpenAerialMap image ID")
) -> dict:
    """
    Get metadata for a specific image by ID.
    
    Example: GET /api/open-aerial-map/projects/59e62b863d6412ef72209ae1
    """
    url = f"{OAM_API_BASE_URL}/meta/{image_id}"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from OpenAerialMap API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}", response_model=ImageryListResponse)
async def get_imagery_by_user(
    user_id: str = Path(..., description="OpenAerialMap user ID"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    page: int = Query(1, ge=1, description="Page number"),
    order_by: str = Query("acquisition_end", description="Field to order by"),
    sort: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
) -> dict:
    """
    Get imagery metadata for a specific user from OpenAerialMap API.
    
    Example: GET /api/open-aerial-map/user/6918b688d06a6f5c0a953e2e?order_by=acquisition_end&sort=desc&limit=10
    """
    url = f"{OAM_API_BASE_URL}/meta"
    
    params = {
        "user": user_id,
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
                detail=f"Error from OpenAerialMap API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
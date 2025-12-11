# portal/backend/app/api/routes/fair/fair.py

import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.fair import FAIRProjectsResponse, FAIRCentroidsResponse, FAIRModelDetail
from hotosm_auth.integrations.fastapi import CurrentUser, OSMConnectionRequired

FAIR_API_BASE_URL = "https://api-prod.fair.hotosm.org/api/v1"

router = APIRouter(prefix="/fair")

@router.get("/projects", response_model=FAIRProjectsResponse)
async def get_fair_projects(
    status: Optional[int] = Query(None, description="Filter by status (0=published, 1=draft, etc.)"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search query"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by model ID"),
) -> dict:
    """
    Get AI models from fAIr (AI-assisted mapping) API.
    
    Example: GET /api/fair/projects?status=0&limit=20&ordering=-created_at
    
    Response:
    ```json
        {
            "count": 212,
            "next": "http://...",
            "previous": null,
            "results": [...]
        }
    ```
    """
    url = f"{FAIR_API_BASE_URL}/model/"
    
    params = {
        "limit": limit,
        "offset": offset,
    }
    
    # Add optional parameters only if present
    if status is not None:
        params["status"] = status
    if search is not None:
        params["search"] = search
    if ordering:
        params["ordering"] = ordering
    if id is not None:
        params["id"] = id
    
    headers = {
        "accept": "application/json",
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
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


@router.get("/models/centroid", response_model=FAIRCentroidsResponse)
async def get_fair_models_centroids() -> dict:
    """
    Get all AI model centroids from fAIr API as GeoJSON.

    Returns a GeoJSON FeatureCollection with Point geometries representing
    the centroid location of each AI model. Each feature includes a `mid`
    (model ID) property that can be used to fetch model details.

    Example: GET /api/fair/models/centroid

    Response:
    ```json
        {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [85.52, 27.63]
                    },
                    "properties": {"mid": 3}
                }
            ]
        }
    ```
    """
    url = f"{FAIR_API_BASE_URL}/models/centroid/"

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from fAIr API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/model/{mid}", response_model=FAIRModelDetail)
async def get_fair_model_detail(mid: int) -> dict:
    """
    Get detailed information for a specific AI model from fAIr API.

    Args:
        mid: The model ID to retrieve details for

    Example: GET /api/fair/model/3

    Response:
    ```json
        {
            "id": 3,
            "name": "Building Model Banepa",
            "description": null,
            "accuracy": 88.9,
            "status": 0,
            "base_model": "RAMP",
            "published_training": 22,
            "user": {"osm_id": 12345, "username": "mapper"},
            "dataset": {"id": 1, "name": "Dataset Name", "source_imagery": "..."},
            "created_at": "2023-01-01T00:00:00Z",
            "last_modified": "2023-06-01T00:00:00Z",
            "thumbnail_url": "https://..."
        }
    ```
    """
    url = f"{FAIR_API_BASE_URL}/model/{mid}/"

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from fAIr API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/model/user/{user_id}", response_model=FAIRProjectsResponse)
async def get_fair_models_by_user(
    user_id: int,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search query"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by model ID"),
) -> dict:
    """
    Get AI models from fAIr API filtered by user ID.
    
    Example: GET /api/fair/model/user/23470445?limit=20&ordering=-created_at
    
    Response:
    ```json
        {
            "count": 5,
            "next": "http://...",
            "previous": null,
            "results": [...]
        }
    ```
    """
    url = f"{FAIR_API_BASE_URL}/model/"
    
    params = {
        "limit": limit,
        "offset": offset,
        "user": user_id,
    }
    
    # Add optional parameters only if present
    if search is not None:
        params["search"] = search
    if ordering:
        params["ordering"] = ordering
    if id is not None:
        params["id"] = id
    
    headers = {
        "accept": "application/json",
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
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

@router.get("/dataset/user/{user_id}")
async def get_fair_datasets_by_user(
    user_id: int,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by dataset ID"),
) -> dict:
    """
    Get datasets from fAIr API filtered by user ID.

    Example: GET /api/fair/dataset/user/23470445?limit=20&ordering=-created_at

    Response:
    ```json
        {
            "count": 3,
            "next": "http://...",
            "previous": null,
            "results": [...]
        }
    ```
    """
    url = f"{FAIR_API_BASE_URL}/dataset/"

    params = {
        "limit": limit,
        "offset": offset,
        "ordering": ordering if ordering else "-created_at",
        "user": user_id,
    }

    # Add optional parameters only if present
    if id is not None:
        params["id"] = id

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
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


@router.get("/me/models", response_model=FAIRProjectsResponse)
async def get_my_fair_models(
    user: CurrentUser,
    osm: OSMConnectionRequired,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search query"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by model ID"),
) -> dict:
    """
    Get AI models from fAIr API for the authenticated user.

    Requires authentication with Hanko and OSM connection.
    Automatically uses the logged-in user's OSM ID.

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie or Bearer token)
    - Requires OSM connection (encrypted cookie from OAuth flow)

    **Returns**:
    - 200: User's models
    - 401: Not authenticated
    - 403: OSM connection required

    Example: GET /api/fair/me/models?limit=20&ordering=-created_at
    """
    url = f"{FAIR_API_BASE_URL}/model/"

    params = {
        "limit": limit,
        "offset": offset,
        "user": osm.osm_user_id,
    }

    if search is not None:
        params["search"] = search
    if ordering:
        params["ordering"] = ordering
    if id is not None:
        params["id"] = id

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
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
    user: CurrentUser,
    osm: OSMConnectionRequired,
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by dataset ID"),
) -> dict:
    """
    Get datasets from fAIr API for the authenticated user.

    Requires authentication with Hanko and OSM connection.
    Automatically uses the logged-in user's OSM ID.

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie or Bearer token)
    - Requires OSM connection (encrypted cookie from OAuth flow)

    **Returns**:
    - 200: User's datasets
    - 401: Not authenticated
    - 403: OSM connection required

    Example: GET /api/fair/me/datasets?limit=20&ordering=-created_at
    """
    url = f"{FAIR_API_BASE_URL}/dataset/"

    params = {
        "limit": limit,
        "offset": offset,
        "ordering": ordering if ordering else "-created_at",
        "user": osm.osm_user_id,
    }

    if id is not None:
        params["id"] = id

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
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
# portal/backend/app/api/routes/map/fair.py

import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.models.fair import FAIRProjectsResponse, FAIRCentroidsResponse, FAIRModelDetail
from app.core.cache import get_cached, set_cached, delete_cached, DEFAULT_TTL
from app.api.routes.shared.fair_helpers import (
    FAIR_API_BASE_URL,
    FAIR_VERIFY_SSL,
    fetch_all_fair_model_names,
)

router = APIRouter(prefix="/fair")
logger = logging.getLogger(__name__)


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
    cache_key = f"fair_projects_{status}_{limit}_{offset}_{search}_{ordering}_{id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

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

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from fAIr API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.delete("/models/centroid/cache")
async def clear_fair_centroids_cache() -> dict:
    """Clear the fAIr centroids cache to force re-fetching with enriched names."""
    deleted = delete_cached("fair_models_centroids")
    return {"deleted": deleted, "message": "Cache cleared. Next request will fetch fresh data with names."}


@router.get("/models/centroid", response_model=FAIRCentroidsResponse)
async def get_fair_models_centroids() -> dict:
    """
    Get all AI model centroids from fAIr API as GeoJSON.

    Returns a GeoJSON FeatureCollection with Point geometries representing
    the centroid location of each AI model. Each feature includes `mid`
    (model ID) and `name` properties.

    Model names are fetched and enriched synchronously on first request,
    then cached for subsequent requests.

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
                    "properties": {"mid": 3, "name": "Building Model Banepa"}
                }
            ]
        }
    ```
    """
    cache_key = "fair_models_centroids"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{FAIR_API_BASE_URL}/models/centroid/"

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            # Fetch model names synchronously and enrich before caching
            logger.info("Fetching fAIr model names for enrichment...")
            model_names = await fetch_all_fair_model_names()

            # Filter out features with null geometry (can't be plotted on map)
            features = data.get("features") or []
            data["features"] = [f for f in features if f.get("geometry") is not None]

            # Enrich centroids with names
            for feature in data["features"]:
                mid = feature.get("properties", {}).get("mid")
                if mid and mid in model_names:
                    feature["properties"]["name"] = model_names[mid]

            logger.info(f"Enriched {len(model_names)} fAIr model names ({len(data['features'])} with geometry)")

            # Cache the enriched data
            set_cached(cache_key, data, DEFAULT_TTL)

            return data
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
    cache_key = f"fair_model_{mid}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{FAIR_API_BASE_URL}/model/{mid}/"

    headers = {
        "accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
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
    cache_key = f"fair_models_user_{user_id}_{limit}_{offset}_{search}_{ordering}_{id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

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

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
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
    cache_key = f"fair_datasets_user_{user_id}_{limit}_{offset}_{ordering}_{id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

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

    async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from fAIr API: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# portal/backend/app/api/routes/fair/fair.py

import asyncio
import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.models.fair import FAIRProjectsResponse, FAIRCentroidsResponse, FAIRModelDetail
from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional
from app.core.cache import get_cached, set_cached, delete_cached, DEFAULT_TTL, LONG_TTL
from app.core.config import settings
from app.core.database import get_db
from app.services import fair_service, plans_service
from app.services.exceptions import UpstreamUnavailable

# fAIr API Configuration (from .env / environment variables)
FAIR_API_BASE_URL = settings.fair_api_url
FAIR_VERIFY_SSL = settings.fair_verify_ssl

router = APIRouter(prefix="/fair")
logger = logging.getLogger(__name__)

logger.info(f"fAIr API URL: {FAIR_API_BASE_URL} (SSL verify: {FAIR_VERIFY_SSL})")

# Flag to track if background enrichment is running
fair_enrichment_in_progress = False


async def fetch_all_fair_model_names() -> dict[int, str]:
    """
    Fetch all fAIr model names by paginating through the API.
    Returns a dict mapping model_id -> name.
    """
    model_names: dict[int, str] = {}
    offset = 0
    limit = 100  # Max limit per request

    async with httpx.AsyncClient(timeout=60.0, verify=FAIR_VERIFY_SSL) as client:
        while True:
            try:
                response = await client.get(
                    f"{FAIR_API_BASE_URL}/model/",
                    params={"limit": limit, "offset": offset},
                    headers={"accept": "application/json"}
                )
                response.raise_for_status()
                data = response.json()

                results = data.get("results", [])
                for model in results:
                    model_id = model.get("id")
                    name = model.get("name")
                    if model_id and name:
                        model_names[model_id] = name

                # Check if there are more pages
                if not data.get("next") or len(results) < limit:
                    break

                offset += limit
            except Exception as e:
                logger.error(f"Error fetching fAIr models page at offset {offset}: {e}")
                break

    return model_names


async def enrich_fair_centroids_in_background():
    """Background task to fetch all model names and update centroids cache."""
    global fair_enrichment_in_progress

    if fair_enrichment_in_progress:
        return

    fair_enrichment_in_progress = True
    cache_key = "fair_models_centroids"

    try:
        logger.info("Starting background enrichment of fAIr model centroids...")

        # Get base centroids data from cache
        base_data = get_cached(cache_key)
        if not base_data:
            # Fetch centroids first
            async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
                response = await client.get(
                    f"{FAIR_API_BASE_URL}/models/centroid/",
                    headers={"accept": "application/json"}
                )
                response.raise_for_status()
                base_data = response.json()

        # Fetch all model names
        model_names = await fetch_all_fair_model_names()

        # Filter out features with null geometry and enrich with names
        features = base_data.get("features") or []
        base_data["features"] = [f for f in features if f.get("geometry") is not None]
        for feature in base_data["features"]:
            mid = feature.get("properties", {}).get("mid")
            if mid and mid in model_names:
                feature["properties"]["name"] = model_names[mid]

        # Update cache with enriched data
        set_cached(cache_key, base_data, DEFAULT_TTL)
        logger.info(f"fAIr enrichment complete. {len(base_data['features'])} models with geometry, {len(model_names)} names enriched.")

    except Exception as e:
        logger.error(f"fAIr background enrichment failed: {e}")
    finally:
        fair_enrichment_in_progress = False


@router.get("/projects", response_model=FAIRProjectsResponse)
async def get_fair_projects(
    status: Optional[int] = Query(None, description="Filter by status (0=published, 1=draft, etc.)"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search query"),
    ordering: Optional[str] = Query("-created_at", description="Order results by field (prefix with - for descending)"),
    id: Optional[int] = Query(None, description="Filter by model ID"),
    user: CurrentUserOptional = None,
    db: AsyncSession = Depends(get_db),
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

    async def enrich(payload: dict) -> dict:
        results = payload.get("results") or []
        owner_id = user.id if user is not None else None
        enriched = await plans_service.enrich_items_with_plans(
            db, owner_id, "fair", results, "id"
        )
        return {**payload, "results": enriched}

    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return await enrich(cached_data)

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
            return await enrich(data)
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
    try:
        result = await fair_service.fetch_model_by_id(str(mid))
    except UpstreamUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    if result is None:
        raise HTTPException(status_code=404, detail=f"fAIr model {mid} not found")
    return result


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

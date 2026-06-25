# portal/backend/app/api/routes/tasking_manager/tasking_manager.py

"""Tasking Manager API endpoints."""

import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, BackgroundTasks
from hotosm_auth_fastapi import CurrentUserOptional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tasking_manager import ProjectsResponse, Project, CountriesResponse
from app.core.cache import get_cached, set_cached, LONG_TTL, DEFAULT_TTL
from app.core.config import settings
from app.core.database import get_db
from app.core.http import DEFAULT_TIMEOUT, make_client
from app.services import plans_service, tasking_manager_service
from app.services.exceptions import UpstreamUnavailable


router = APIRouter(prefix="/tasking-manager")
logger = logging.getLogger(__name__)

HOTOSM_API_BASE_URL = settings.tasking_manager_api_url


@router.get("/projects", response_model=ProjectsResponse)
async def get_tasking_manager_projects(
    background_tasks: BackgroundTasks,
    user: CurrentUserOptional = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Gets all projects from the HOT OSM Tasking Manager.

    Returns data immediately (without names on first load), then enriches in background.
    Subsequent requests will have project names.

    Returns:
        dict: JSON with Tasking Manager projects

    Raises:
        HTTPException: If there is an error when querying the external API

    Example:
        ```bash
        curl http://localhost:8000/api/tasking-manager/projects
        ```

    Response:
        ```json
        {
          "mapResults": {...},
          "results": [...],
          "pagination": {...}
        }
        ```
    """
    cache_key = "tasking_manager_projects"

    async def enrich(data: dict) -> dict:
        results = data.get("results") or []
        owner_id = user.id if user is not None else None
        enriched = await plans_service.enrich_items_with_plans(
            db, owner_id, "tasking-manager", results, "projectId"
        )
        return {**data, "results": enriched}

    # Check cache first - if enriched data exists, return it immediately
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return await enrich(cached_data)

    url = f"{HOTOSM_API_BASE_URL}/projects/"
    params = {"action": "any", "omitMapResults": "false"}

    try:
        async with make_client(timeout=DEFAULT_TIMEOUT) as client:
            # Fetch initial response with mapResults (fast, single request)
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            # Cache the base data immediately (without names)
            set_cached(cache_key, data, DEFAULT_TTL)

            # Schedule background enrichment
            background_tasks.add_task(tasking_manager_service.fetch_and_enrich_in_background)

            return await enrich(data)

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error al consultar API de HOT OSM: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error de conexión con API de HOT OSM: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error inesperado: {str(e)}"
        )

@router.get("/countries", response_model=CountriesResponse)
async def get_hotosm_countries() -> dict:
    """
    Fetch all countries from HOT OSM Tasking Manager.

    This endpoint retrieves the list of countries available in the
    HOT OSM Tasking Manager system.

    Returns:
        dict: JSON with countries list

    Raises:
        HTTPException: If there's an error querying the external API

    Example:
        ```bash
        curl http://localhost:8000/api/tasking-manager/countries
        ```

    Response:
        ```json
        {
          "tags": [
            "Argentina",
            ...
          ]
        }
        ```
    """
    cache_key = "tasking_manager_countries"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{HOTOSM_API_BASE_URL}/countries/"

    try:
        async with make_client(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, LONG_TTL)
            return data
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying HOT OSM API: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Connection error with HOT OSM API: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Unexpected error: {str(e)}"
        )
    
@router.get("/projectid/{project_id}", response_model=Project)
async def get_tasking_manager_project_by_id(
    project_id: int = Path(..., description="The project ID to retrieve", gt=0)
) -> dict:
    """
    Fetch and filter a specific project by ID from HOT OSM Tasking Manager.
    Only returns selected fields.

    Example:
        ```bash
        curl http://localhost:8000/api/tasking-manager/projectid/123
        ```

    Response:
        ```json
        {
          "organisationName": "...",
          "organisationSlug": "...",
          "projectInfo": {...},
          ...
        }
        ```
    """
    try:
        result = await tasking_manager_service.fetch_project_by_id(str(project_id))
    except UpstreamUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    if result is None:
        raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found")
    return result


@router.get("/projects/user")
async def get_user_projects() -> dict:
    """
    Fetch projects mapped by the authenticated user from HOT OSM Tasking Manager.

    This endpoint retrieves all projects that have been mapped by the
    currently authenticated user using the provided Authorization token.

    Returns:
        dict: JSON with user's projects

    Raises:
        HTTPException: If there's an error querying the external API

    Example:
        ```bash
        curl http://localhost:8000/api/tasking-manager/projects/user
        ```

    Response:
        ```json
        {
          "mapResults": {...},
          "results": [...],
          "pagination": {...}
        }
        ```
    """
    cache_key = "tasking_manager_user_projects"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{HOTOSM_API_BASE_URL}/projects/"
    params = {"mappedByMe": "true", "action": "any"}
    headers = {
        "Authorization": ""
    }

    try:
        async with make_client(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying HOT OSM API: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Connection error with HOT OSM API: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )
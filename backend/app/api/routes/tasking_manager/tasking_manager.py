# portal/backend/app/api/routes/tasking_manager/tasking_manager.py

"""Tasking Manager API endpoints."""

import asyncio
import logging
import httpx
from fastapi import APIRouter, HTTPException, Path, BackgroundTasks
from app.models.tasking_manager import ProjectsResponse, Project, CountriesResponse
from app.core.cache import get_cached, set_cached, LONG_TTL, DEFAULT_TTL


router = APIRouter(prefix="/tasking-manager")
logger = logging.getLogger(__name__)

# HOT OSM Tasking Manager API base URL
HOTOSM_API_BASE_URL = "https://tasking-manager-production-api.hotosm.org/api/v2"

# Flag to track if background enrichment is running
_enrichment_in_progress = False


async def fetch_page(client: httpx.AsyncClient, page: int) -> list[dict]:
    """Fetch a single page of projects."""
    params = {"action": "any", "omitMapResults": "true", "page": page}
    response = await client.get(f"{HOTOSM_API_BASE_URL}/projects/", params=params)
    response.raise_for_status()
    data = response.json()
    return data.get("results", [])


async def fetch_all_project_names(client: httpx.AsyncClient, total_projects: int, per_page: int = 14) -> dict[int, str]:
    """
    Fetch all project names by paginating through the API in parallel.
    Returns a dict mapping projectId -> name.
    """
    total_pages = (total_projects + per_page - 1) // per_page
    project_names: dict[int, str] = {}
    batch_size = 15  # Increased batch size for faster fetching

    for batch_start in range(1, total_pages + 1, batch_size):
        batch_end = min(batch_start + batch_size, total_pages + 1)
        pages = range(batch_start, batch_end)

        tasks = [fetch_page(client, page) for page in pages]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, Exception):
                continue
            for project in result:
                project_id = project.get("projectId")
                name = project.get("name")
                if project_id and name:
                    project_names[project_id] = name

    return project_names


def enrich_data_with_names(data: dict, project_names: dict[int, str]) -> dict:
    """Enrich project data with names."""
    if data.get("mapResults") and data["mapResults"].get("features"):
        for feature in data["mapResults"]["features"]:
            project_id = feature.get("properties", {}).get("projectId")
            if project_id and project_id in project_names:
                feature["properties"]["name"] = project_names[project_id]

    for result in data.get("results", []):
        project_id = result.get("projectId")
        if project_id and project_id in project_names and not result.get("name"):
            result["name"] = project_names[project_id]

    return data


async def fetch_and_enrich_in_background():
    """Background task to fetch all project names and update cache."""
    global _enrichment_in_progress

    if _enrichment_in_progress:
        return

    _enrichment_in_progress = True
    cache_key = "tasking_manager_projects"
    enriched_cache_key = "tasking_manager_projects_enriched"

    try:
        logger.info("🔄 Starting background enrichment of Tasking Manager projects...")

        async with httpx.AsyncClient(timeout=120.0) as client:
            # Get base data from cache or fetch it
            base_data = get_cached(cache_key)
            if not base_data:
                url = f"{HOTOSM_API_BASE_URL}/projects/"
                params = {"action": "any", "omitMapResults": "false"}
                response = await client.get(url, params=params)
                response.raise_for_status()
                base_data = response.json()

            # Get total projects
            pagination = base_data.get("pagination", {})
            total_projects = pagination.get("total", 0)

            # Fetch all names
            project_names = await fetch_all_project_names(client, total_projects)

            # Create enriched copy
            import copy
            enriched_data = copy.deepcopy(base_data)
            enrich_data_with_names(enriched_data, project_names)

            # Update cache with enriched data
            set_cached(cache_key, enriched_data, DEFAULT_TTL)
            set_cached(enriched_cache_key, True, DEFAULT_TTL)  # Flag that enrichment is done

            logger.info(f"✅ Background enrichment complete. Enriched {len(project_names)} project names.")

    except Exception as e:
        logger.error(f"❌ Background enrichment failed: {e}")
    finally:
        _enrichment_in_progress = False


@router.get("/projects", response_model=ProjectsResponse)
async def get_tasking_manager_projects(background_tasks: BackgroundTasks) -> dict:
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

    # Check cache first - if enriched data exists, return it immediately
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{HOTOSM_API_BASE_URL}/projects/"
    params = {"action": "any", "omitMapResults": "false"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch initial response with mapResults (fast, single request)
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            # Cache the base data immediately (without names)
            set_cached(cache_key, data, DEFAULT_TTL)

            # Schedule background enrichment
            background_tasks.add_task(fetch_and_enrich_in_background)

            return data

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
        async with httpx.AsyncClient(timeout=30.0) as client:
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
    cache_key = f"tasking_manager_project_{project_id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}/"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            # Extraer solo las claves que te interesan
            filtered_data = {
                "organisationName": data.get("organisationName"),
                "organisationSlug": data.get("organisationSlug"),
                "projectInfo": data.get("projectInfo"),
                "projectInfoLocales": data.get("projectInfoLocales"),
                "created": data.get("created"),
                "percentMapped": data.get("percentMapped"),
                "percentValidated": data.get("percentValidated"),
                "percentBadImagery": data.get("percentBadImagery"),
            }

            set_cached(cache_key, filtered_data, DEFAULT_TTL)
            return filtered_data

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Project with ID {project_id} not found",
            )
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
        async with httpx.AsyncClient(timeout=30.0) as client:
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
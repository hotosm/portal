"""Tasking Manager API endpoints."""

import httpx
from fastapi import APIRouter, HTTPException, Path

router = APIRouter()

# HOT OSM Tasking Manager API base URL
HOTOSM_API_BASE_URL = "https://tasking-manager-production-api.hotosm.org/api/v2"

@router.get("/tasking-manager-projects")
async def get_tasking_manager_projects() -> dict:
    """
    Gets all projects from the HOT OSM Tasking Manager.

    This endpoint consumes the HOT OSM external API and returns the full list of available projects.

    Returns:
        dict: JSON with Tasking Manager projects

    Raises:
        HTTPException: If there is an error when querying the external API

    Example:
        ```bash
        curl http://localhost:8000/api/hotosm-projects
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
    url = f"{HOTOSM_API_BASE_URL}/projects/"
    params = {"action": "any", "omitMapResults": "false"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
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

@router.get("/tasking-manager-countries")
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
                curl http://localhost:8000/api/tasking-manager-countries
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
    url = f"{HOTOSM_API_BASE_URL}/countries/"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
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
    
@router.get("/tasking-manager-projectid/{project_id}")
async def get_tasking_manager_project_by_id(
    project_id: int = Path(..., description="The project ID to retrieve", gt=0)
) -> dict:
    """
    Fetch a specific project by ID from HOT OSM Tasking Manager.

    This endpoint retrieves detailed information about a single project
    using its unique identifier.

    Args:
        project_id: The unique identifier of the project (must be positive)

    Returns:
        dict: JSON with detailed project information

    Raises:
        HTTPException: If there's an error querying the external API or project not found

    Example:
        ```bash
                curl http://localhost:8000/api/tasking-manager-projectid/33006
        ```

    Response:
        ```json
                {
                  "projectId": 33006,
                  "status": "PUBLISHED",
                  "projectPriority": "URGENT",
                  "areaOfInterest": {...},
                  "projectInfo": {...},
                  "tasks": {...}
                }
        ```
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}/"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
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
            status_code=500, detail=f"Unexpected error: {str(e)}"
        )
"""Tasking Manager API endpoints."""

import httpx
from fastapi import APIRouter, HTTPException, Path

router = APIRouter(prefix="/tasking-manager")

# HOT OSM Tasking Manager API base URL
HOTOSM_API_BASE_URL = "https://tasking-manager-production-api.hotosm.org/api/v2"

@router.get("/projects")
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

@router.get("/countries")
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
    
@router.get("/projectid/{project_id}")
async def get_tasking_manager_project_by_id(
    project_id: int = Path(..., description="The project ID to retrieve", gt=0)
) -> dict:
    """
    Fetch and filter a specific project by ID from HOT OSM Tasking Manager.
    Only returns selected fields.
    """
    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}/"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            # 🔹 Extraer solo las claves que te interesan
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

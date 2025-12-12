# portal/backend/app/api/routes/field_tm/field_tm.py

"""FMTM API endpoints."""

import httpx
from fastapi import APIRouter, HTTPException, Path
from app.models.field_tm import FMTMProjectsResponse, FMTMProjectSummary
from app.core.cache import get_cached, set_cached, DEFAULT_TTL

router = APIRouter(prefix="/field-tm")

# FMTM API base URL
FMTM_API_BASE_URL = "https://api.fmtm.hotosm.org"


@router.get("/projects", response_model=FMTMProjectsResponse)
async def get_fmtm_projects() -> dict:
    """
    Gets all project summaries from the FMTM API.

    This endpoint consumes the FMTM external API and returns the full list
    of available project summaries.

    Returns:
        dict: JSON with FMTM project summaries

    Raises:
        HTTPException: If there is an error when querying the external API

    Example:
    ```bash
        curl http://localhost:8000/api/field-tm/projects
    ```

    Response:
    ```json
        {
            "projects": {
                "results": [...],
                "pagination": {...}
            }
        }
    ```
    """
    cache_key = "fmtm_projects"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{FMTM_API_BASE_URL}/projects/summaries"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            result = {"projects": data}
            set_cached(cache_key, result, DEFAULT_TTL)
            return result
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying FMTM API: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"FMTM API connection error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Unexpected error: {str(e)}"
        )


@router.get("/projectid/{project_id}", response_model=FMTMProjectSummary)
async def get_fmtm_project_by_id(
    project_id: int = Path(..., description="The project ID to retrieve", gt=0)
) -> dict:
    """
    Fetch a specific project by ID from FMTM API.

    This endpoint retrieves detailed information about a specific project
    from the FMTM system.

    Args:
        project_id: The unique identifier of the project

    Returns:
        dict: JSON with project details

    Raises:
        HTTPException: If there's an error querying the external API or
                      if the project is not found

    Example:
    ```bash
        curl http://localhost:8000/api/field-tm/projectid/443
    ```

    Response:
    ```json
        {
            "id": 123,
            "name": "Project Name",
            "description": "Project description",
            ...
        }
    ```
    """
    cache_key = f"fmtm_project_{project_id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{FMTM_API_BASE_URL}/projects/{project_id}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            set_cached(cache_key, data, DEFAULT_TTL)
            return data
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Project with ID {project_id} not found",
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying FMTM API: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"FMTM API connection error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )

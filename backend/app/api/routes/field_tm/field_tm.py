"""FMTM API endpoints."""

import httpx
from fastapi import APIRouter, HTTPException, Path

router = APIRouter(prefix="/field-tm")

# FMTM API base URL
FMTM_API_BASE_URL = "https://api.fmtm.hotosm.org"


@router.get("/projects")
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
        curl http://localhost:8000/api/fmtm/projects
        ```

    Response:
        ```json
        [
            {
                "id": 1,
                "name": "Project Name",
                ...
            }
        ]
        ```
    """
    url = f"{FMTM_API_BASE_URL}/projects/summaries"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
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


@router.get("/projectid/{project_id}")
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
        curl http://localhost:8000/api/fmtm/projectid/443
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
    url = f"{FMTM_API_BASE_URL}/projects/{project_id}"

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
            detail=f"Typing error: {str(e)}",
        )
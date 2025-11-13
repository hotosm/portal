"""uMap API endpoints."""

import httpx
from fastapi import APIRouter, HTTPException, Path
from app.models.umap import UMapFeatureCollection


router = APIRouter(prefix="/umap")

# uMap HOT OSM base URL
UMAP_API_BASE_URL = "https://umap.hotosm.org/en/datalayer"


@router.get("/{location}/{project_id}", response_model=UMapFeatureCollection)
async def get_umap_data(
    location: str = Path(..., description="Location identifier"),
    project_id: str = Path(..., description="The project UUID to retrieve")
) -> dict:
    """
    Fetch GeoJSON data from uMap HOT OSM.
    
    This endpoint retrieves geographic features from a specific uMap layer.
    
    Args:
        location: Location identifier (e.g., "1428")
        project_id: Project UUID (e.g., "a59b5458-8c8e-48b1-911f-4c6c602fc357")
    
    Returns:
        dict: GeoJSON FeatureCollection with map data
    
    Raises:
        HTTPException: If there's an error querying the external API
    
    Example:
        ```bash
        curl http://localhost:8000/api/umap/1428/a59b5458-8c8e-48b1-911f-4c6c602fc357
        ```
    
    Response:
        ```json
        {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [-76.793844, 17.971321]
              },
              "properties": {
                "description": "...",
                "_umap_options": {...}
              },
              "id": "I0NDU"
            }
          ],
          "_umap_options": {...}
        }
        ```
    """
    url = f"{UMAP_API_BASE_URL}/{location}/{project_id}/"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"uMap data not found for location '{location}' and project '{project_id}'",
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error querying uMap API: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Connection error with uMap API: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )
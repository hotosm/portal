# portal/backend/app/api/routes/umap/umap.py

"""uMap API endpoints."""

import re
import httpx
from fastapi import APIRouter, HTTPException, Path
from app.models.umap import UMapFeatureCollection
from app.core.cache import get_cached, set_cached, DEFAULT_TTL


router = APIRouter(prefix="/umap")

# uMap HOT OSM base URL
UMAP_API_BASE_URL = "https://umap.hotosm.org/en/datalayer"

# Hardcoded cookies for authenticated requests to the uMap instance
_HARDCODED_COOKIES = {
    "csrftoken": "",
    "sessionid": "",
}


@router.get("/user/templates")
async def get_user_templates() -> dict:
    """Fetch the user's templates page from uMap and return a JSON list.

    - Retrieves `https://umap.hotosm.org/es/me/templates` using the
      hardcoded cookies.
    - Parses the returned HTML for links to maps of the form
      `/es/map/map_<id>` (also accepts `/map/map_<id>` without locale).
    - Returns JSON with an array under `templates` containing objects with
      `id`, `href` and `url` keys.
    """
    url = "https://umap.hotosm.org/es/me/templates"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # include a common User-Agent and the hardcoded cookies
            headers = {"User-Agent": "portal-umap-client/1.0"}
            response = await client.get(url, headers=headers, cookies=_HARDCODED_COOKIES)
            response.raise_for_status()
            html = response.text

            # Find hrefs like /es/map/map_1814 or /map/map_1814
            # Capture the full href and the numeric id
            pattern = re.compile(r'href=["\'](?P<href>/(?:[a-z]{2}/)?map/map_(?P<id>\d+))["\']')
            matches = pattern.findall(html)

            templates = []
            seen = set()
            for href, mid in matches:
                # Skip hrefs with ?share or ?edit query parameters
                if "?share" in href or "?edit" in href:
                    continue
                if mid in seen:
                    continue
                seen.add(mid)
                full_url = f"https://umap.hotosm.org{href}"
                templates.append({"id": mid, "href": href, "url": full_url})

            return {"templates": templates}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching uMap templates: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/user/maps")
async def get_user_maps() -> dict:
    """Fetch the user's maps page from uMap and return a JSON list.

    - Retrieves `https://umap.hotosm.org/es/me` using the hardcoded cookies.
    - Parses the returned HTML for links to maps of the form `/es/map/{project}`
      (where project can be anything like `umap-test-makeni_1813`).
    - Returns JSON with an array under `maps` containing objects with
      `project`, `href` and `url` keys.
    """
    url = "https://umap.hotosm.org/es/me"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # include a common User-Agent and the hardcoded cookies
            headers = {"User-Agent": "portal-umap-client/1.0"}
            response = await client.get(url, headers=headers, cookies=_HARDCODED_COOKIES)
            response.raise_for_status()
            html = response.text

            # Find hrefs like /es/map/umap-test-makeni_1813 or /map/umap-test-makeni_1813
            # Capture the full href and the project name
            pattern = re.compile(r'href=["\'](?P<href>/(?:[a-z]{2}/)?map/(?P<project>[^/"\']*))["\']')
            matches = pattern.findall(html)

            maps = []
            seen = set()
            for href, project in matches:
                # Skip hrefs with ?share or ?edit query parameters
                if "?share" in href or "?edit" in href:
                    continue
                if project in seen:
                    continue
                seen.add(project)
                full_url = f"https://umap.hotosm.org{href}"
                maps.append({"project": project, "href": href, "url": full_url})

            return {"maps": maps}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching uMap maps: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")



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
    cache_key = f"umap_{location}_{project_id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{UMAP_API_BASE_URL}/{location}/{project_id}/"

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

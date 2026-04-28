# portal/backend/app/api/routes/umap/umap.py

"""uMap API endpoints."""

import os
import re
import logging
import httpx
from fastapi import APIRouter, HTTPException, Path, Request
from app.models.umap import (
    UMapFeatureCollection,
    ShowcaseResponse,
)
from app.core.cache import get_cached, set_cached, DEFAULT_TTL
from app.core.config import settings
from app.services import umap_service
from app.services.exceptions import UpstreamUnavailable

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/umap")

UMAP_BASE_URL = settings.umap_base_url
UMAP_LOCALE = "en"
UMAP_API_BASE_URL = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/datalayer"
UMAP_SHOWCASE_URL = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/showcase/"
UMAP_VERIFY_SSL = os.getenv("UMAP_VERIFY_SSL", "false").lower() == "true"

MAP_LINK_RE = re.compile(
    r'<a\s[^>]*href="(/(?:[a-z]{2}/)?map/([^/?#"]+_(\d+)))"[^>]*>\s*([^<]+?)\s*</a>',
    re.IGNORECASE | re.DOTALL,
)


def umap_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=30.0, verify=UMAP_VERIFY_SSL, follow_redirects=True)


def require_hanko(request: Request) -> str:
    cookie = request.cookies.get("hanko")
    if not cookie:
        raise HTTPException(status_code=401, detail="Hanko authentication cookie not found.")
    return cookie


def parse_map_links(html: str) -> list[dict]:
    """Extract unique map entries from a uMap HTML page.

    Returns dicts matching the UMapMap frontend interface:
    {id, name, description, slug, url, modified_at}.
    Skips duplicates.
    """
    seen_ids: set[str] = set()
    results: list[dict] = []

    for m in MAP_LINK_RE.finditer(html):
        url = m.group(1)
        slug = m.group(2)
        map_id = m.group(3)
        name = m.group(4).strip()
        if map_id not in seen_ids:
            seen_ids.add(map_id)
            results.append({
                "id": map_id,
                "name": name,
                "description": None,
                "slug": slug,
                "url": url,
                "modified_at": "",
            })

    return results


@router.get("/user/maps")
async def get_user_maps(
    request: Request,
    limit: int = 20,
    offset: int = 0,
) -> dict:
    """Fetch the authenticated user's maps from uMap."""
    hanko_cookie = require_hanko(request)
    url = f"{UMAP_BASE_URL}/api/v1/maps/?source=mine"

    try:
        async with umap_client() as client:
            response = await client.get(url, cookies={"hanko": hanko_cookie})
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="uMap authentication failed.")
            response.raise_for_status()
            data = response.json()
            maps = data.get("maps", [])
            logger.info(f"[Maps] Found {len(maps)} maps")
            return {"total": len(maps), "maps": maps[offset : offset + limit]}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"uMap error: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")



@router.get("/showcase", response_model=ShowcaseResponse)
async def get_showcase() -> ShowcaseResponse:
    """Fetch the list of featured maps from the uMap showcase page.

    Returns a GeoJSON FeatureCollection where each feature represents a map,
    with author and map URL parsed from the description field.
    """
    cache_key = "umap_showcase"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True,
        ) as client:
            response = await client.get(UMAP_SHOWCASE_URL)
            response.raise_for_status()
            data = response.json()

        features = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            description = props.get("description", "")

            # Extract author from [[/en/user/NAME/|NAME]]
            author_match = re.search(r"\[\[/en/user/([^/|]+)/?[|][^\]]+\]\]", description)
            author = author_match.group(1) if author_match else None

            # Extract map path from [[/en/map/slug_id|...]]
            map_match = re.search(r"\[\[(/en/map/[^|]+)\|[^\]]+\]\]", description)
            map_path = map_match.group(1) if map_match else None
            map_url = f"{UMAP_BASE_URL}{map_path}" if map_path else None

            # Extract map_id from the trailing _<digits> in slug
            map_id = None
            if map_path:
                parts = map_path.rsplit("_", 1)
                if len(parts) > 1 and parts[-1].isdigit():
                    map_id = parts[-1]

            features.append({
                "type": feature.get("type", "Feature"),
                "geometry": feature.get("geometry"),
                "properties": {
                    "name": props.get("name", ""),
                    "description": description,
                    "author": author,
                    "map_url": map_url,
                    "map_id": map_id,
                },
            })

        result = {
            "type": data.get("type", "FeatureCollection"),
            "features": features,
            "total": len(features),
        }
        set_cached(cache_key, result, DEFAULT_TTL)
        return result

    except httpx.HTTPStatusError as e:
        logger.error(f"[Showcase] HTTP Error: {e.response.status_code}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error fetching uMap showcase: {e.response.text}",
        )
    except httpx.RequestError as e:
        logger.error(f"[Showcase] Request Error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Connection error to uMap showcase: {str(e)}",
        )
    except Exception as e:
        logger.error(f"[Showcase] Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )


@router.get("/{location}/{project_id}", response_model=UMapFeatureCollection)
async def get_umap_data(
    location: str = Path(..., description="Location identifier"),
    project_id: str = Path(..., description="The project UUID to retrieve"),
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
    try:
        result = await umap_service.fetch_map_by_location(f"{location}/{project_id}")
    except UpstreamUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"uMap data not found for location '{location}' and project '{project_id}'",
        )
    return result

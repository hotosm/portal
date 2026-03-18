# portal/backend/app/api/routes/umap/umap.py

"""uMap API endpoints."""

import os
import re
import logging
import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, Path, Request
from app.models.umap import (
    UMapFeatureCollection,
    ShowcaseResponse,
    UserMapsResponse,
    UserTemplatesResponse,
)
from app.core.cache import get_cached, set_cached, DEFAULT_TTL
from app.core.config import settings

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/umap")

# uMap HOT OSM URLs derived from settings
UMAP_BASE_URL = settings.umap_base_url
UMAP_LOCALE = settings.umap_locale
UMAP_API_BASE_URL = f"{UMAP_BASE_URL}/en/datalayer"
UMAP_SHOWCASE_URL = f"{UMAP_BASE_URL}/en/showcase/"

# SSL verification: disabled by default for .test domains (self-signed certs)
# Set UMAP_VERIFY_SSL=true in production with valid certificates
UMAP_VERIFY_SSL = os.getenv("UMAP_VERIFY_SSL", "false").lower() == "true"

# Matches /es/map/slug_123 or /map/slug_123 (any locale prefix or none)
_MAP_HREF_RE = re.compile(r"^/(?:[a-z]{2}/)?map/(.+)$")

logger.info(f"uMap Base URL: {UMAP_BASE_URL}")
logger.info(f"uMap Locale: {UMAP_LOCALE}")
logger.info(f"uMap SSL Verification: {UMAP_VERIFY_SSL}")


def _parse_map_links(html: str) -> list[dict]:
    """Extract unique map entries from an HTML page using BeautifulSoup.

    Returns a list of dicts with keys: id, slug, href, url.
    Skips ?share / ?edit variants and deduplicates by map ID.
    """
    soup = BeautifulSoup(html, "html.parser")
    results = []
    seen: set[str] = set()

    for a in soup.find_all("a", href=True):
        href: str = a["href"]
        if "?share" in href or "?edit" in href:
            continue
        match = _MAP_HREF_RE.match(href)
        if not match:
            continue
        slug = match.group(1)
        parts = slug.rsplit("_", 1)
        map_id = parts[-1] if len(parts) > 1 and parts[-1].isdigit() else slug
        if map_id in seen:
            continue
        seen.add(map_id)
        results.append(
            {"id": map_id, "slug": slug, "href": href, "url": f"{UMAP_BASE_URL}{href}"}
        )

    return results


def _check_login_redirect(response: httpx.Response, html: str) -> bool:
    """Return True if uMap redirected to the login page (auth failed)."""
    return "/login" in str(response.url) or "Iniciar sesión" in html


@router.get("/user/templates", response_model=UserTemplatesResponse)
async def get_user_templates(request: Request) -> dict:
    """Fetch the user's templates page from uMap and return a JSON list.

    Uses Hanko authentication cookie to authenticate with the uMap instance.
    Returns JSON with an array under `templates` containing objects with
    `id`, `href`, `url` and `slug` keys.
    """
    hanko_cookie = request.cookies.get("hanko")
    logger.info(f"[Templates] Hanko cookie present: {bool(hanko_cookie)}")

    if not hanko_cookie:
        logger.warning("No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in.",
        )

    url = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/me/templates"
    logger.info(f"[Templates] Target URL: {url}")

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True,
        ) as client:
            response = await client.get(
                url,
                headers={"User-Agent": "portal-umap-client/1.0"},
                cookies={"hanko": hanko_cookie},
            )
            response.raise_for_status()
            html = response.text

            logger.info(f"[Templates] Final URL: {response.url}")
            logger.info(f"[Templates] Response length: {len(html)} chars")
            logger.debug(f"[Templates] HTML preview: {html[:500]}")

            if _check_login_redirect(response, html):
                logger.warning("[Templates] Auth failed - redirected to login page")
                raise HTTPException(
                    status_code=401,
                    detail="uMap authentication failed. Your session may have expired.",
                )

            templates = _parse_map_links(html)
            logger.info(f"[Templates] Found {len(templates)} templates")
            return {"templates": templates}

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error fetching uMap templates: {e.response.text}",
        )
    except httpx.RequestError as e:
        logger.error(f"Request Error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/user/maps", response_model=UserMapsResponse)
async def get_user_maps(request: Request) -> dict:
    """Fetch the user's maps page from uMap and return a JSON list.

    Uses Hanko authentication cookie to authenticate with the uMap instance.
    Returns JSON with an array under `maps` containing objects with
    `id`, `slug`, `href` and `url` keys.
    """
    hanko_cookie = request.cookies.get("hanko")
    logger.info(f"[Maps] Hanko cookie present: {bool(hanko_cookie)}")

    if not hanko_cookie:
        logger.warning("No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in.",
        )

    url = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/me"
    logger.info(f"[Maps] Target URL: {url}")

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True,
        ) as client:
            response = await client.get(
                url,
                headers={"User-Agent": "portal-umap-client/1.0"},
                cookies={"hanko": hanko_cookie},
            )
            response.raise_for_status()
            html = response.text

            logger.info(f"[Maps] Final URL: {response.url}")
            logger.info(f"[Maps] Response length: {len(html)} chars")

            if _check_login_redirect(response, html):
                logger.warning("[Maps] Auth failed - redirected to login page")
                raise HTTPException(
                    status_code=401,
                    detail="uMap authentication failed. Your session may have expired.",
                )

            maps = _parse_map_links(html)
            logger.info(f"[Maps] Found {len(maps)} maps")
            return {"maps": maps}

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error fetching uMap maps: {e.response.text}",
        )
    except httpx.RequestError as e:
        logger.error(f"Request Error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


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
    cache_key = f"umap_{location}_{project_id}"
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{UMAP_API_BASE_URL}/{location}/{project_id}/"

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True,
        ) as client:
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

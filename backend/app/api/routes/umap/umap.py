# portal/backend/app/api/routes/umap/umap.py

"""uMap API endpoints."""

import os
import re
import logging
import httpx
from fastapi import APIRouter, HTTPException, Path, Request
from app.models.umap import UMapFeatureCollection
from app.core.cache import get_cached, set_cached, DEFAULT_TTL
from app.core.config import settings

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/umap")

# uMap HOT OSM URLs derived from settings
UMAP_BASE_URL = settings.umap_base_url
UMAP_API_BASE_URL = f"{UMAP_BASE_URL}/en/datalayer"

# SSL verification: disabled by default for .test domains (self-signed certs)
# Set UMAP_VERIFY_SSL=true in production with valid certificates
UMAP_VERIFY_SSL = os.getenv("UMAP_VERIFY_SSL", "false").lower() == "true"

logger.info(f"🗺️ uMap Base URL: {UMAP_BASE_URL}")
logger.info(f"🔒 uMap SSL Verification: {UMAP_VERIFY_SSL}")


@router.get("/user/templates")
async def get_user_templates(request: Request) -> dict:
    """Fetch the user's templates page from uMap and return a JSON list.

    Uses Hanko authentication cookie to authenticate with the uMap instance.
    Parses the returned HTML for links to maps of the form
    `/es/map/map_<id>` (also accepts `/map/map_<id>` without locale).
    Returns JSON with an array under `templates` containing objects with
    `id`, `href` and `url` keys.
    """
    # Extract Hanko cookie from the incoming request
    hanko_cookie = request.cookies.get("hanko")

    logger.info(f"🍪 [Templates] Hanko cookie present: {bool(hanko_cookie)}")

    if not hanko_cookie:
        logger.warning("❌ No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in."
        )

    url = f"{UMAP_BASE_URL}/es/me/templates"
    logger.info(f"🌐 [Templates] Target URL: {url}")

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True
        ) as client:
            headers = {"User-Agent": "portal-umap-client/1.0"}
            # Send hanko token as cookie (uMap's HankoAuthMiddleware reads from cookies)
            cookies = {"hanko": hanko_cookie}
            response = await client.get(url, headers=headers, cookies=cookies)
            response.raise_for_status()
            html = response.text

            logger.info(f"🔗 [Templates] Final URL: {response.url}")
            logger.info(f"📄 [Templates] Response length: {len(html)} chars")

            # Log first 500 chars of HTML for debugging
            logger.debug(f"[Templates] HTML preview: {html[:500]}")

            # Check if we were redirected to login page (auth failed)
            # Look for login indicators in URL or page title
            is_login_page = "/login" in str(response.url) or "Iniciar sesión" in html
            if is_login_page:
                logger.warning("❌ [Templates] Auth failed - redirected to login page")
                raise HTTPException(
                    status_code=401,
                    detail="uMap authentication failed. Your session may have expired."
                )

            # Find hrefs like /es/map/mapa-sin-titulo_1814 or /map/some-slug_123
            # URL format: /<locale>/map/<slug>_<id> where slug can be any string
            pattern = re.compile(r'href=["\'](?P<href>/(?:[a-z]{2}/)?map/(?P<slug>[^"\']+))["\']')
            matches = pattern.findall(html)

            templates = []
            seen = set()
            for href, slug in matches:
                # Skip hrefs with ?share or ?edit query parameters
                if "?share" in href or "?edit" in href:
                    continue
                # Extract ID from slug (format: "name_123" -> "123")
                # The ID is the number at the end after the last underscore
                parts = slug.rsplit('_', 1)
                template_id = parts[-1] if len(parts) > 1 and parts[-1].isdigit() else slug
                if template_id in seen:
                    continue
                seen.add(template_id)
                full_url = f"{UMAP_BASE_URL}{href}"
                templates.append({"id": template_id, "href": href, "url": full_url, "slug": slug})

            logger.info(f"✅ [Templates] Found {len(templates)} templates from {len(matches)} matches")
            return {"templates": templates}
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching uMap templates: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"❌ Request Error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/user/maps")
async def get_user_maps(request: Request) -> dict:
    """Fetch the user's maps page from uMap and return a JSON list.

    Uses Hanko authentication cookie to authenticate with the uMap instance.
    Parses the returned HTML for links to maps of the form `/es/map/{project}`
    (where project can be anything like `umap-test-makeni_1813`).
    Returns JSON with an array under `maps` containing objects with
    `project`, `href` and `url` keys.
    """
    # Extract Hanko cookie from the incoming request
    hanko_cookie = request.cookies.get("hanko")

    logger.info(f"🍪 [Maps] Hanko cookie present: {bool(hanko_cookie)}")

    if not hanko_cookie:
        logger.warning("❌ No Hanko cookie found in request")
        raise HTTPException(
            status_code=401,
            detail="Hanko authentication cookie not found. Please log in."
        )

    url = f"{UMAP_BASE_URL}/es/me"
    logger.info(f"🌐 [Maps] Target URL: {url}")

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True
        ) as client:
            headers = {"User-Agent": "portal-umap-client/1.0"}
            # Send hanko token as cookie (uMap's HankoAuthMiddleware reads from cookies)
            cookies = {"hanko": hanko_cookie}
            response = await client.get(url, headers=headers, cookies=cookies)
            response.raise_for_status()
            html = response.text

            logger.info(f"🔗 [Maps] Final URL: {response.url}")
            logger.info(f"📄 [Maps] Response length: {len(html)} chars")

            # Check if we were redirected to login page (auth failed)
            is_login_page = "/login" in str(response.url) or "Iniciar sesión" in html
            if is_login_page:
                logger.warning("❌ [Maps] Auth failed - redirected to login page")
                raise HTTPException(
                    status_code=401,
                    detail="uMap authentication failed. Your session may have expired."
                )

            # Find hrefs like /es/map/umap-test-makeni_1813 or /map/some-slug_123
            # URL format: /<locale>/map/<slug>_<id> where slug can be any string
            pattern = re.compile(r'href=["\'](?P<href>/(?:[a-z]{2}/)?map/(?P<slug>[^"\']+))["\']')
            matches = pattern.findall(html)

            maps = []
            seen = set()
            for href, slug in matches:
                # Skip hrefs with ?share or ?edit query parameters
                if "?share" in href or "?edit" in href:
                    continue
                # Extract ID from slug (format: "name_123" -> "123")
                parts = slug.rsplit('_', 1)
                map_id = parts[-1] if len(parts) > 1 and parts[-1].isdigit() else slug
                if map_id in seen:
                    continue
                seen.add(map_id)
                full_url = f"{UMAP_BASE_URL}{href}"
                maps.append({"id": map_id, "slug": slug, "href": href, "url": full_url})

            logger.info(f"✅ [Maps] Found {len(maps)} maps from {len(matches)} matches")
            return {"maps": maps}
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching uMap maps: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"❌ Request Error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
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
        async with httpx.AsyncClient(
            timeout=30.0,
            verify=UMAP_VERIFY_SSL,
            follow_redirects=True
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

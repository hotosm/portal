"""uMap service: reusable fetch-by-location/id with caching."""

import os

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

UMAP_BASE_URL = settings.umap_base_url
UMAP_LOCALE = "en"
UMAP_API_BASE_URL = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/datalayer"
UMAP_VERIFY_SSL = os.getenv("UMAP_VERIFY_SSL", "false").lower() == "true"


async def fetch_map_by_location(project_id: str) -> dict | None:
    """Fetch a uMap datalayer (GeoJSON). Used by GET /umap/{location}/{project_id}.

    project_id must be packed as "<location>/<datalayer_uuid>".
    """
    if "/" not in project_id:
        return None

    location, real_project_id = project_id.split("/", 1)

    cache_key = f"umap_{location}_{real_project_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{UMAP_API_BASE_URL}/{location}/{real_project_id}/"
    try:
        async with httpx.AsyncClient(
            timeout=30.0, verify=UMAP_VERIFY_SSL, follow_redirects=True
        ) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"umap: {e}") from e

    set_cached(cache_key, data, DEFAULT_TTL)
    return data


async def fetch_map_metadata_by_id(map_id: str) -> dict | None:
    """Fetch uMap map metadata by numeric map ID. Used for plan hydration.

    Returns {"name": ..., "url": ...} so PlanProjectCard can display the title
    and build the full map URL via getUmapBaseUrl() + upstream.url.
    """
    cache_key = f"umap_map_meta_{map_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{UMAP_BASE_URL}/api/v1/maps/{map_id}/"
    try:
        async with httpx.AsyncClient(
            timeout=30.0, verify=UMAP_VERIFY_SSL, follow_redirects=True
        ) as client:
            response = await client.get(url)
            if response.status_code in (404, 403):
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"umap: {e}") from e

    filtered = {
        "name": data.get("name"),
        "url": data.get("url"),
    }
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered

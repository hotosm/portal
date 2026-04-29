"""OpenAerialMap service: reusable fetch-by-id with caching (API fallback)."""

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

OAM_API_BASE_URL = settings.oam_api_url


async def fetch_imagery_by_id(image_id: str) -> dict | None:
    """Fetch OAM image metadata by id via the live API. None on 404, raises UpstreamUnavailable on failure.

    Note: this does not consult the local oam_images DB table — hydration of plans
    uses the live API directly so orphan detection works even when local sync is stale.
    """
    cache_key = f"oam_image_{image_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{OAM_API_BASE_URL}/meta/{image_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"open-aerial-map: {e}") from e

    results = data.get("results") or []
    if not results:
        return None
    result = results[0]
    filtered = {
        "title": result.get("title"),
        "thumbnail": (result.get("properties") or {}).get("thumbnail"),
    }
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered

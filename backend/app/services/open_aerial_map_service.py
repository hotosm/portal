"""OpenAerialMap service: reusable fetch-by-id with caching (API fallback)."""

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.services.exceptions import UpstreamUnavailable

# Always use the public OAM API for individual image lookups (plan hydration,
# URL resolution). settings.oam_api_url is for the local STAC sync (oam_service.py).
_OAM_PUBLIC_API = "https://api.openaerialmap.org"


async def fetch_imagery_by_id(
    image_id: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Fetch OAM image metadata by id.

    None on 404, raises UpstreamUnavailable on failure.
    Note: this does not consult the local oam_images DB table — hydration of plans
    uses the live API directly so orphan detection works even when local sync is stale.

    image_id may be a compound "{user_id}:{image_id}" (produced by url_resolver for
    /user/ URLs). Only the image_id portion is used for the API call.
    """
    image_id = image_id.split(":")[-1]
    cache_key = f"oam_image_{image_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    url = f"{base_url or _OAM_PUBLIC_API}/meta/{image_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"open-aerial-map: {e}") from e

    raw = data.get("results") or []
    if not raw:
        return None
    result = raw if isinstance(raw, dict) else raw[0]
    filtered = {
        "title": result.get("title"),
        "thumbnail": (result.get("properties") or {}).get("thumbnail"),
        "bbox": result.get("bbox"),
    }
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered

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
    /user/ URLs). The user_id is preserved here to resolve file-UUID-based IDs (see
    OAM bug comment below); only image_id is used in the primary /meta/{id} call.
    """
    user_id: str | None = None
    if ":" in image_id:
        user_id, image_id = image_id.split(":", 1)
    cache_key = f"oam_image_{image_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    api_base = base_url or _OAM_PUBLIC_API
    url = f"{api_base}/meta/{image_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            if response.status_code == 500 and user_id:
                # OAM map URLs use the S3 file UUID, not the MongoDB _id.
                # /meta/{file_uuid} crashes with 500; look up the real record via
                # /user/{user_id} by matching uuid ending in /{file_uuid}.tif.
                user_resp = await client.get(f"{api_base}/user/{user_id}")
                user_resp.raise_for_status()
                images = user_resp.json().get("results", {}).get("images", [])
                suffix = f"/{image_id}.tif"
                result = next(
                    (img for img in images if (img.get("uuid") or "").endswith(suffix)),
                    None,
                )
                if result is None:
                    return None
                filtered = {
                    "title": result.get("title"),
                    "thumbnail": (result.get("properties") or {}).get("thumbnail"),
                    "bbox": result.get("bbox"),
                }
                set_cached(cache_key, filtered, DEFAULT_TTL)
                return filtered
            elif response.status_code == 500:
                return None
            else:
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

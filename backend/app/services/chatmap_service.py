"""ChatMap service: fetch map metadata by UUID for plan hydration and URL resolution."""

import os

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

CHATMAP_API_URL = settings.chatmap_api_url
CHATMAP_VERIFY_SSL = os.getenv("CHATMAP_VERIFY_SSL", "false").lower() == "true"


async def fetch_map_by_id(
    map_id: str,
    *,
    base_url: str | None = None,
    hanko_cookie: str | None = None,
) -> dict | None:
    """Fetch a ChatMap map by UUID. None if not found or private/unauthorized.

    Returns {"name": ..., "id": ...} on success.
    Raises UpstreamUnavailable on connection or server errors.
    """
    cache_key = f"chatmap_map_{map_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{base_url or CHATMAP_API_URL}/map/{map_id}"
    cookies = {"hanko": hanko_cookie} if hanko_cookie else {}
    try:
        async with httpx.AsyncClient(
            timeout=30.0, verify=CHATMAP_VERIFY_SSL, follow_redirects=True
        ) as client:
            response = await client.get(
                url, headers={"accept": "application/json"}, cookies=cookies
            )
            if response.status_code in (401, 403, 404):
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"chatmap: {e}") from e

    features = data.get("features") or []
    coords = [
        f["geometry"]["coordinates"]
        for f in features
        if isinstance(f.get("geometry"), dict)
        and f["geometry"].get("type") == "Point"
        and isinstance(f["geometry"].get("coordinates"), list)
        and len(f["geometry"]["coordinates"]) >= 2
    ]
    if coords:
        centroid: list[float] | None = [
            sum(c[1] for c in coords) / len(coords),  # lat
            sum(c[0] for c in coords) / len(coords),  # lon
        ]
    else:
        centroid = None

    filtered = {"name": data.get("name"), "id": data.get("id"), "centroid": centroid}
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered

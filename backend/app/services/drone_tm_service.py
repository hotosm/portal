"""Drone Tasking Manager service: reusable fetch-by-id with caching."""

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

DRONE_TM_BACKEND_URL = settings.drone_tm_api_url


def verify_ssl() -> bool:
    return not DRONE_TM_BACKEND_URL.startswith("https://") or settings.drone_tm_verify_ssl


async def fetch_project_by_id(project_id: str) -> dict | None:
    """Fetch a single DroneTM project by id. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"dronetm_project_{project_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{DRONE_TM_BACKEND_URL}/projects/{project_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl()) as client:
            response = await client.get(url, headers={"Accept": "application/json"})
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"drone-tasking-manager: {e}") from e

    set_cached(cache_key, data, DEFAULT_TTL)
    return data

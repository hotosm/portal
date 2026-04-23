"""Field Tasking Manager (FMTM) service: reusable fetch-by-id with caching."""

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.services.exceptions import UpstreamUnavailable

FMTM_API_BASE_URL = "https://api.fmtm.hotosm.org"


async def fetch_project_by_id(project_id: str) -> dict | None:
    """Fetch a single FMTM project by id. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"fmtm_project_{project_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{FMTM_API_BASE_URL}/projects/{project_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"field-tm: {e}") from e

    set_cached(cache_key, data, DEFAULT_TTL)
    return data

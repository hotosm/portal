"""Export Tool service: reusable fetch-by-id with caching."""

import httpx

from app.core.cache import SHORT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

EXPORT_TOOL_API_BASE_URL = settings.export_tool_api_url


async def fetch_job_by_uid(uid: str) -> dict | None:
    """Fetch an export job by uid. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"export_job_{uid}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{EXPORT_TOOL_API_BASE_URL}/jobs/{uid}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"export-tool: {e}") from e

    set_cached(cache_key, data, SHORT_TTL)
    return data

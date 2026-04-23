"""Tasking Manager service: reusable fetch-by-id with caching."""

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

HOTOSM_API_BASE_URL = settings.tasking_manager_api_url


async def fetch_project_by_id(project_id: str) -> dict | None:
    """Fetch a single TM project by id. Returns None on 404, raises UpstreamUnavailable on failures."""
    cache_key = f"tasking_manager_project_{project_id}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}/"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"tasking-manager: {e}") from e

    filtered = {
        "organisationName": data.get("organisationName"),
        "organisationSlug": data.get("organisationSlug"),
        "projectInfo": data.get("projectInfo"),
        "projectInfoLocales": data.get("projectInfoLocales"),
        "created": data.get("created"),
        "percentMapped": data.get("percentMapped"),
        "percentValidated": data.get("percentValidated"),
        "percentBadImagery": data.get("percentBadImagery"),
    }
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered

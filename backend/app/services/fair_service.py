"""fAIr service: reusable fetch-by-id with caching."""

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.services.exceptions import UpstreamUnavailable

FAIR_API_BASE_URL = settings.fair_api_url
FAIR_VERIFY_SSL = settings.fair_verify_ssl


async def fetch_model_by_id(mid: str) -> dict | None:
    """Fetch a single fAIr model by id. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"fair_model_{mid}"
    cached = get_cached(cache_key)
    if cached is not None:
        return cached

    url = f"{FAIR_API_BASE_URL}/model/{mid}/"
    try:
        async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
            response = await client.get(url, headers={"accept": "application/json"})
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"fair: {e}") from e

    set_cached(cache_key, data, DEFAULT_TTL)
    return data

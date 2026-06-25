"""fAIr service: model fetching, centroid name enrichment and caching."""

import logging

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.core.http import DEFAULT_TIMEOUT, SLOW_TIMEOUT, make_client
from app.services.exceptions import UpstreamUnavailable

logger = logging.getLogger(__name__)

FAIR_API_BASE_URL = settings.fair_api_url
FAIR_VERIFY_SSL = settings.fair_verify_ssl

# Cache key shared with the route layer.
CENTROIDS_CACHE_KEY = "fair_models_centroids"

# Guards the background enrichment so only one run happens at a time.
_enrichment_in_progress = False


async def fetch_model_by_id(
    mid: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Fetch a single fAIr model by id. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"fair_model_{mid}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    url = f"{base_url or FAIR_API_BASE_URL}/model/{mid}/"
    try:
        async with make_client(timeout=DEFAULT_TIMEOUT, verify=FAIR_VERIFY_SSL) as client:
            response = await client.get(url, headers={"accept": "application/json"})
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"fair: {e}") from e

    set_cached(cache_key, data, DEFAULT_TTL)
    return data


async def fetch_all_fair_model_names() -> dict[int, str]:
    """Paginate through the fAIr model API, returning a model_id -> name map."""
    model_names: dict[int, str] = {}
    offset = 0
    limit = 100  # Max limit per request.

    async with make_client(timeout=SLOW_TIMEOUT, verify=FAIR_VERIFY_SSL) as client:
        while True:
            try:
                response = await client.get(
                    f"{FAIR_API_BASE_URL}/model/",
                    params={"limit": limit, "offset": offset},
                    headers={"accept": "application/json"},
                )
                response.raise_for_status()
                data = response.json()

                results = data.get("results", [])
                for model in results:
                    model_id = model.get("id")
                    name = model.get("name")
                    if model_id and name:
                        model_names[model_id] = name

                if not data.get("next") or len(results) < limit:
                    break

                offset += limit
            except Exception as e:
                logger.error("Error fetching fAIr models page at offset %s: %s", offset, e)
                break

    return model_names


async def enrich_centroids_in_background() -> None:
    """Refresh the cached model centroids with names and drop null geometries.

    Single-flight: a second call while one is running returns immediately.
    """
    global _enrichment_in_progress

    if _enrichment_in_progress:
        return

    _enrichment_in_progress = True
    try:
        logger.info("Starting background enrichment of fAIr model centroids...")

        base_data = get_cached(CENTROIDS_CACHE_KEY)
        if not base_data:
            async with make_client(timeout=DEFAULT_TIMEOUT, verify=FAIR_VERIFY_SSL) as client:
                response = await client.get(
                    f"{FAIR_API_BASE_URL}/models/centroid/",
                    headers={"accept": "application/json"},
                )
                response.raise_for_status()
                base_data = response.json()

        model_names = await fetch_all_fair_model_names()

        features = base_data.get("features") or []
        base_data["features"] = [f for f in features if f.get("geometry") is not None]
        for feature in base_data["features"]:
            mid = feature.get("properties", {}).get("mid")
            if mid and mid in model_names:
                feature["properties"]["name"] = model_names[mid]

        set_cached(CENTROIDS_CACHE_KEY, base_data, DEFAULT_TTL)
        logger.info(
            "fAIr enrichment complete. %s models with geometry, %s names enriched.",
            len(base_data["features"]),
            len(model_names),
        )
    except Exception as e:
        logger.error("fAIr background enrichment failed: %s", e)
    finally:
        _enrichment_in_progress = False

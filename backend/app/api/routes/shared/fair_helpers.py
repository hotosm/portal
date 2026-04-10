"""Shared helpers for fAIr endpoints (used by both map and user routes)."""

import logging

import httpx

from app.core.cache import get_cached, set_cached, DEFAULT_TTL
from app.core.config import settings

logger = logging.getLogger(__name__)

FAIR_API_BASE_URL = settings.fair_api_url
FAIR_VERIFY_SSL = settings.fair_verify_ssl

# Flag to track if background enrichment is running
_fair_enrichment_in_progress = False


async def fetch_all_fair_model_names() -> dict[int, str]:
    """
    Fetch all fAIr model names by paginating through the API.
    Returns a dict mapping model_id -> name.
    """
    model_names: dict[int, str] = {}
    offset = 0
    limit = 100  # Max limit per request

    async with httpx.AsyncClient(timeout=60.0, verify=FAIR_VERIFY_SSL) as client:
        while True:
            try:
                response = await client.get(
                    f"{FAIR_API_BASE_URL}/model/",
                    params={"limit": limit, "offset": offset},
                    headers={"accept": "application/json"}
                )
                response.raise_for_status()
                data = response.json()

                results = data.get("results", [])
                for model in results:
                    model_id = model.get("id")
                    name = model.get("name")
                    if model_id and name:
                        model_names[model_id] = name

                # Check if there are more pages
                if not data.get("next") or len(results) < limit:
                    break

                offset += limit
            except Exception as e:
                logger.error(f"Error fetching fAIr models page at offset {offset}: {e}")
                break

    return model_names


async def enrich_fair_centroids_in_background():
    """Background task to fetch all model names and update centroids cache."""
    global _fair_enrichment_in_progress

    if _fair_enrichment_in_progress:
        return

    _fair_enrichment_in_progress = True
    cache_key = "fair_models_centroids"

    try:
        logger.info("Starting background enrichment of fAIr model centroids...")

        # Get base centroids data from cache
        base_data = get_cached(cache_key)
        if not base_data:
            # Fetch centroids first
            async with httpx.AsyncClient(timeout=30.0, verify=FAIR_VERIFY_SSL) as client:
                response = await client.get(
                    f"{FAIR_API_BASE_URL}/models/centroid/",
                    headers={"accept": "application/json"}
                )
                response.raise_for_status()
                base_data = response.json()

        # Fetch all model names
        model_names = await fetch_all_fair_model_names()

        # Filter out features with null geometry and enrich with names
        features = base_data.get("features") or []
        base_data["features"] = [f for f in features if f.get("geometry") is not None]
        for feature in base_data["features"]:
            mid = feature.get("properties", {}).get("mid")
            if mid and mid in model_names:
                feature["properties"]["name"] = model_names[mid]

        # Update cache with enriched data
        set_cached(cache_key, base_data, DEFAULT_TTL)
        logger.info(f"fAIr enrichment complete. {len(base_data['features'])} models with geometry, {len(model_names)} names enriched.")

    except Exception as e:
        logger.error(f"fAIr background enrichment failed: {e}")
    finally:
        _fair_enrichment_in_progress = False

"""Tasking Manager service: project fetching, name enrichment and caching."""

import asyncio
import copy
import logging

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.core.http import BULK_TIMEOUT, DEFAULT_TIMEOUT, make_client
from app.services.exceptions import UpstreamUnavailable

logger = logging.getLogger(__name__)

HOTOSM_API_BASE_URL = settings.tasking_manager_api_url

# Cache keys shared with the route layer.
PROJECTS_CACHE_KEY = "tasking_manager_projects"
PROJECTS_ENRICHED_CACHE_KEY = "tasking_manager_projects_enriched"

# Guards the background enrichment so only one run happens at a time.
_enrichment_in_progress = False


async def fetch_project_by_id(
    project_id: str, *, force_refresh: bool = False
) -> dict | None:
    """Fetch a single TM project by id. Returns None on 404, raises UpstreamUnavailable on failures."""
    cache_key = f"tasking_manager_project_{project_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    url = f"{HOTOSM_API_BASE_URL}/projects/{project_id}/"
    try:
        async with make_client(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"tasking-manager: {e}") from e

    project_info = data.get("projectInfo") or {}
    filtered = {
        "name": project_info.get("name"),
        "organisationName": data.get("organisationName"),
        "organisationSlug": data.get("organisationSlug"),
        "projectInfo": project_info,
        "projectInfoLocales": data.get("projectInfoLocales"),
        "created": data.get("created"),
        "percentMapped": data.get("percentMapped"),
        "percentValidated": data.get("percentValidated"),
        "percentBadImagery": data.get("percentBadImagery"),
        "aoiBBOX": data.get("aoiBBOX"),
    }
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered


async def _fetch_page(client: httpx.AsyncClient, page: int) -> list[dict]:
    """Fetch a single page of projects."""
    params = {"action": "any", "omitMapResults": "true", "page": page}
    response = await client.get(f"{HOTOSM_API_BASE_URL}/projects/", params=params)
    response.raise_for_status()
    data = response.json()
    return data.get("results", [])


async def fetch_all_project_names(
    client: httpx.AsyncClient, total_projects: int, per_page: int = 14
) -> dict[int, str]:
    """Paginate through the API in parallel, returning a projectId -> name map."""
    total_pages = (total_projects + per_page - 1) // per_page
    project_names: dict[int, str] = {}
    batch_size = 15  # Number of pages fetched concurrently per batch.

    for batch_start in range(1, total_pages + 1, batch_size):
        batch_end = min(batch_start + batch_size, total_pages + 1)
        pages = range(batch_start, batch_end)

        tasks = [_fetch_page(client, page) for page in pages]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, Exception):
                continue
            for project in result:
                project_id = project.get("projectId")
                name = project.get("name")
                if project_id and name:
                    project_names[project_id] = name

    return project_names


def enrich_data_with_names(data: dict, project_names: dict[int, str]) -> dict:
    """Fill in project names on map features and result rows, in place."""
    if data.get("mapResults") and data["mapResults"].get("features"):
        for feature in data["mapResults"]["features"]:
            project_id = feature.get("properties", {}).get("projectId")
            if project_id and project_id in project_names:
                feature["properties"]["name"] = project_names[project_id]

    for result in data.get("results", []):
        project_id = result.get("projectId")
        if project_id and project_id in project_names and not result.get("name"):
            result["name"] = project_names[project_id]

    return data


async def fetch_and_enrich_in_background() -> None:
    """Fetch all project names and refresh the cached projects with them.

    Single-flight: a second call while one is running returns immediately.
    """
    global _enrichment_in_progress

    if _enrichment_in_progress:
        return

    _enrichment_in_progress = True
    try:
        logger.info("Starting background enrichment of Tasking Manager projects...")

        async with make_client(timeout=BULK_TIMEOUT) as client:
            base_data = get_cached(PROJECTS_CACHE_KEY)
            if not base_data:
                url = f"{HOTOSM_API_BASE_URL}/projects/"
                params = {"action": "any", "omitMapResults": "false"}
                response = await client.get(url, params=params)
                response.raise_for_status()
                base_data = response.json()

            total_projects = base_data.get("pagination", {}).get("total", 0)
            project_names = await fetch_all_project_names(client, total_projects)

            enriched_data = copy.deepcopy(base_data)
            enrich_data_with_names(enriched_data, project_names)

            set_cached(PROJECTS_CACHE_KEY, enriched_data, DEFAULT_TTL)
            set_cached(PROJECTS_ENRICHED_CACHE_KEY, True, DEFAULT_TTL)

            logger.info(
                "Background enrichment complete. Enriched %s project names.",
                len(project_names),
            )
    except Exception as e:
        logger.error("Background enrichment failed: %s", e)
    finally:
        _enrichment_in_progress = False

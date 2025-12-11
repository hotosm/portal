# portal/backend/app/api/routes/homepage_map/homepage_map.py

"""Homepage Map API - Unified endpoint for all map data sources."""

import asyncio
import httpx
import os
import logging
from fastapi import APIRouter

from app.models.homepage_map import (
    UnifiedMapResponse,
    TaskingManagerMapItem,
    OpenAerialMapItem,
    DroneTMMapItem,
    FAIRMapItem,
    UnifiedGeometry,
    SourceStatus,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/homepage-map")

# External API URLs
HOTOSM_TM_API_URL = "https://tasking-manager-production-api.hotosm.org/api/v2"
OAM_API_URL = "https://api.openaerialmap.org"
DRONE_TM_API_URL = os.getenv("DRONE_TM_BACKEND_URL", "http://hotosm-dronetm-backend:8000/api")
FAIR_API_URL = "https://api-prod.fair.hotosm.org/api/v1"


async def fetch_tm_project_details(
    client: httpx.AsyncClient,
    project_id: int,
    semaphore: asyncio.Semaphore
) -> dict | None:
    """Fetch details for a single Tasking Manager project."""
    async with semaphore:
        try:
            url = f"{HOTOSM_TM_API_URL}/projects/{project_id}/"
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.warning(f"Failed to fetch TM project {project_id}: {e}")
            return None


async def fetch_tasking_manager_projects(
    client: httpx.AsyncClient,
    max_concurrent: int = 10
) -> tuple[list[TaskingManagerMapItem], SourceStatus]:
    """Fetch projects from Tasking Manager API.

    Gets project centroids from /projects and enriches with details from /projects/{id}.

    Args:
        client: HTTP client
        max_concurrent: Max concurrent requests for project details (default: 10)
    """
    items = []
    status = SourceStatus(success=True, count=0)

    try:
        # Step 1: Get all project centroids (id + coordinates)
        url = f"{HOTOSM_TM_API_URL}/projects/"
        params = {"action": "any", "omitMapResults": "false"}
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        map_results = data.get("mapResults", {})
        features = map_results.get("features", []) if isinstance(map_results, dict) else []

        if not features:
            status.count = 0
            return items, status

        # Build geometry lookup by project_id
        geometry_lookup = {}
        project_ids = []
        for feature in features:
            props = feature.get("properties", {})
            geom = feature.get("geometry", {})
            project_id = props.get("projectId")

            if project_id:
                project_ids.append(project_id)
                coords = geom.get("coordinates", [])
                geometry_lookup[project_id] = UnifiedGeometry(
                    type=geom.get("type", "Point"),
                    coordinates=coords if coords else []
                ) if geom and coords else None

        logger.info(f"Found {len(project_ids)} TM projects, fetching details...")

        # Step 2: Fetch details for each project concurrently (with limit)
        semaphore = asyncio.Semaphore(max_concurrent)
        detail_tasks = [
            fetch_tm_project_details(client, pid, semaphore)
            for pid in project_ids
        ]
        details_results = await asyncio.gather(*detail_tasks)

        # Step 3: Combine geometry with details
        for project_id, details in zip(project_ids, details_results):
            geometry = geometry_lookup.get(project_id)

            if details:
                project_info = details.get("projectInfo", {}) or {}
                items.append(TaskingManagerMapItem(
                    id=project_id,
                    name=project_info.get("name"),
                    description=project_info.get("description"),
                    geometry=geometry,
                    organisation=details.get("organisationName"),
                    percent_mapped=details.get("percentMapped"),
                    percent_validated=details.get("percentValidated"),
                    created=details.get("created"),
                ))
            else:
                # If details fetch failed, still include with basic info
                items.append(TaskingManagerMapItem(
                    id=project_id,
                    name=None,
                    description=None,
                    geometry=geometry,
                ))

        status.count = len(items)
        logger.info(f"Fetched {len(items)} projects from Tasking Manager with details")

    except httpx.HTTPStatusError as e:
        status.success = False
        status.error = f"HTTP {e.response.status_code}: {e.response.text[:200]}"
        logger.error(f"Tasking Manager API error: {status.error}")
    except Exception as e:
        status.success = False
        status.error = str(e)[:200]
        logger.error(f"Tasking Manager fetch error: {e}")

    return items, status


async def fetch_open_aerial_map_projects(client: httpx.AsyncClient) -> tuple[list[OpenAerialMapItem], SourceStatus]:
    """Fetch imagery from Open Aerial Map API."""
    items = []
    status = SourceStatus(success=True, count=0)

    try:
        url = f"{OAM_API_URL}/meta"
        params = {"limit": 100, "sort": "desc"}
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])

        for result in results:
            bbox = result.get("bbox", [])
            # Calculate centroid from bbox [minLon, minLat, maxLon, maxLat]
            geometry = None
            if bbox and len(bbox) >= 4:
                center_lon = (bbox[0] + bbox[2]) / 2
                center_lat = (bbox[1] + bbox[3]) / 2
                geometry = UnifiedGeometry(
                    type="Point",
                    coordinates=[center_lon, center_lat]
                )

            props = result.get("properties", {})

            items.append(OpenAerialMapItem(
                id=result.get("_id", result.get("uuid", "")),
                name=result.get("title"),
                description=None,
                geometry=geometry,
                bbox=bbox,
                provider=result.get("provider"),
                gsd=result.get("gsd"),
                acquisition_start=result.get("acquisition_start"),
                acquisition_end=result.get("acquisition_end"),
                thumbnail=props.get("thumbnail") if props else None,
            ))

        status.count = len(items)
        logger.info(f"Fetched {len(items)} images from Open Aerial Map")

    except httpx.HTTPStatusError as e:
        status.success = False
        status.error = f"HTTP {e.response.status_code}: {e.response.text[:200]}"
        logger.error(f"Open Aerial Map API error: {status.error}")
    except Exception as e:
        status.success = False
        status.error = str(e)[:200]
        logger.error(f"Open Aerial Map fetch error: {e}")

    return items, status


async def fetch_drone_tm_projects(_client: httpx.AsyncClient) -> tuple[list[DroneTMMapItem], SourceStatus]:
    """Fetch project centroids from Drone Tasking Manager API.

    Note: Uses its own client due to different SSL verification requirements.
    """
    items = []
    status = SourceStatus(success=True, count=0)

    verify_ssl = not DRONE_TM_API_URL.startswith("https://") or os.getenv("DRONE_TM_VERIFY_SSL", "false").lower() == "true"

    try:
        url = f"{DRONE_TM_API_URL}/projects/centroids"
        headers = {"Accept": "application/json"}

        async with httpx.AsyncClient(timeout=30.0, verify=verify_ssl) as drone_client:
            response = await drone_client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            # Handle both array and object responses
            centroids = data if isinstance(data, list) else data.get("results", [])

            for centroid in centroids:
                centroid_geom = centroid.get("centroid", {})
                geometry = None
                if centroid_geom:
                    geometry = UnifiedGeometry(
                        type=centroid_geom.get("type", "Point"),
                        coordinates=centroid_geom.get("coordinates", [])
                    )

                items.append(DroneTMMapItem(
                    id=centroid.get("id", ""),
                    name=centroid.get("name"),
                    description=None,
                    geometry=geometry,
                    slug=centroid.get("slug"),
                    status=centroid.get("status"),
                    total_task_count=centroid.get("total_task_count"),
                    ongoing_task_count=centroid.get("ongoing_task_count"),
                    completed_task_count=centroid.get("completed_task_count"),
                ))

        status.count = len(items)
        logger.info(f"Fetched {len(items)} projects from Drone TM")

    except httpx.HTTPStatusError as e:
        status.success = False
        status.error = f"HTTP {e.response.status_code}: {e.response.text[:200]}"
        logger.error(f"Drone TM API error: {status.error}")
    except Exception as e:
        status.success = False
        status.error = str(e)[:200]
        logger.error(f"Drone TM fetch error: {e}")

    return items, status


async def fetch_fair_models(client: httpx.AsyncClient) -> tuple[list[FAIRMapItem], SourceStatus]:
    """Fetch model centroids from fAIr API and enrich with model details."""
    items = []
    status = SourceStatus(success=True, count=0)

    try:
        # Get centroids (mid + coordinates)
        centroids_url = f"{FAIR_API_URL}/models/centroid/"
        headers = {"accept": "application/json"}
        response = await client.get(centroids_url, headers=headers)
        response.raise_for_status()
        centroid_data = response.json()

        features = centroid_data.get("features", [])

        # Get model list for additional details
        models_url = f"{FAIR_API_URL}/model/"
        models_response = await client.get(models_url, params={"limit": 100}, headers=headers)
        models_response.raise_for_status()
        models_data = models_response.json()

        # Create a lookup dict for model details
        models_lookup = {}
        for model in models_data.get("results", []):
            models_lookup[model.get("id")] = model

        for feature in features:
            props = feature.get("properties", {})
            geom = feature.get("geometry", {})
            mid = props.get("mid")

            geometry = UnifiedGeometry(
                type=geom.get("type", "Point"),
                coordinates=geom.get("coordinates", [])
            ) if geom else None

            # Get additional details from models lookup
            model_details = models_lookup.get(mid, {})
            user = model_details.get("user", {})

            items.append(FAIRMapItem(
                id=mid,
                name=model_details.get("name"),
                description=model_details.get("description"),
                geometry=geometry,
                accuracy=model_details.get("accuracy"),
                status=model_details.get("status"),
                base_model=model_details.get("base_model"),
                thumbnail_url=model_details.get("thumbnail_url"),
                username=user.get("username") if user else None,
                created_at=model_details.get("created_at"),
            ))

        status.count = len(items)
        logger.info(f"Fetched {len(items)} models from fAIr")

    except httpx.HTTPStatusError as e:
        status.success = False
        status.error = f"HTTP {e.response.status_code}: {e.response.text[:200]}"
        logger.error(f"fAIr API error: {status.error}")
    except Exception as e:
        status.success = False
        status.error = str(e)[:200]
        logger.error(f"fAIr fetch error: {e}")

    return items, status


@router.get("/unified", response_model=UnifiedMapResponse)
async def get_unified_map_data(
    include_tasking_manager: bool = True,
    include_open_aerial_map: bool = True,
    include_drone_tm: bool = True,
    include_fair: bool = True,
) -> dict:
    """
    Get unified map data from all sources for the homepage map.

    This endpoint aggregates data from:
    - Tasking Manager (HOT OSM projects)
    - Open Aerial Map (aerial imagery)
    - Drone Tasking Manager (drone mapping projects)
    - fAIr (AI models)

    All data is normalized to include geographic coordinates for map display.

    Args:
        include_tasking_manager: Include Tasking Manager projects
        include_open_aerial_map: Include Open Aerial Map imagery
        include_drone_tm: Include Drone TM projects
        include_fair: Include fAIr AI models

    Example: GET /api/homepage-map/unified

    Example with filters: GET /api/homepage-map/unified?include_fair=false

    Response:
    ```json
    {
        "tasking_manager": [...],
        "open_aerial_map": [...],
        "drone_tasking_manager": [...],
        "fair": [...],
        "sources_status": {
            "tasking_manager": {"success": true, "count": 100, "error": null},
            ...
        },
        "total_count": 500
    }
    ```
    """
    results = {
        "tasking_manager": [],
        "open_aerial_map": [],
        "drone_tasking_manager": [],
        "fair": [],
        "sources_status": {},
        "total_count": 0,
    }

    # Increased timeout for TM which fetches details for each project
    async with httpx.AsyncClient(timeout=120.0) as client:
        tasks = []
        task_names = []

        if include_tasking_manager:
            tasks.append(fetch_tasking_manager_projects(client))
            task_names.append("tasking_manager")

        if include_open_aerial_map:
            tasks.append(fetch_open_aerial_map_projects(client))
            task_names.append("open_aerial_map")

        if include_drone_tm:
            tasks.append(fetch_drone_tm_projects(client))
            task_names.append("drone_tasking_manager")

        if include_fair:
            tasks.append(fetch_fair_models(client))
            task_names.append("fair")

        # Execute all fetches concurrently
        fetch_results = await asyncio.gather(*tasks, return_exceptions=True)

        for name, result in zip(task_names, fetch_results):
            if isinstance(result, Exception):
                results["sources_status"][name] = SourceStatus(
                    success=False,
                    count=0,
                    error=str(result)[:200]
                )
                logger.error(f"Exception fetching {name}: {result}")
            else:
                items, status = result
                results[name] = items
                results["sources_status"][name] = status
                results["total_count"] += len(items)

    return results
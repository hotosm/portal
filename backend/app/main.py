"""Main FastAPI application."""

import asyncio
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth

# Map (public) routes
from app.api.routes.map import example as map_example
from app.api.routes.map import homepage_map as map_homepage_map
from app.api.routes.map import tasking_manager as map_tasking_manager
from app.api.routes.map import drone_tasking_manager as map_drone_tm
from app.api.routes.map import open_aerial_map as map_oam
from app.api.routes.map import fair as map_fair
from app.api.routes.map import field_tm as map_field_tm
from app.api.routes.map import umap as map_umap
from app.api.routes.map import export_tool as map_export_tool

# User (authenticated) routes
from app.api.routes.user import test as user_test
from app.api.routes.user import chatmap as user_chatmap
from app.api.routes.user import open_aerial_map as user_oam
from app.api.routes.user import drone_tasking_manager as user_drone_tm
from app.api.routes.user import fair as user_fair
from app.api.routes.user import umap as user_umap
from app.api.routes.user import export_tool as user_export_tool

# Shared helpers
from app.api.routes.shared.drone_tm_helpers import build_dronetm_cache_key
from app.api.routes.map.open_aerial_map import start_sync_scheduler

# DB models (register with Base.metadata)
from app.api.routes.map.db.models.oam import OAMImage  # noqa: F401
from app.api.routes.map.db.models.map_project import MapProject  # noqa: F401

from app.core.config import settings
from app.core.database import AsyncSessionLocal, check_db_connection

def get_homepage_map_sync_interval_seconds() -> int:
    return settings.homepage_map_sync_interval_hours * 60 * 60


async def homepage_map_sync_loop() -> None:
    """Continuously sync homepage map projects into DB every configured interval."""
    from app.services import map_projects_service

    while True:
        try:
            async with AsyncSessionLocal() as db:
                counts = await map_projects_service.sync_from_sources(db)
                logger.info("Homepage map scheduled sync complete (upserted rows): %s", counts)
        except asyncio.CancelledError:
            logger.info("Homepage map scheduled sync cancelled")
            raise
        except Exception as e:
            logger.warning("Homepage map scheduled sync failed (non-critical): %s", e)

        await asyncio.sleep(get_homepage_map_sync_interval_seconds())


async def preload_cache():
    """Preload cache with frequently accessed data on startup."""
    import httpx
    from app.api.routes.map.tasking_manager import fetch_and_enrich_in_background
    from app.api.routes.shared.fair_helpers import enrich_fair_centroids_in_background
    from app.core.cache import get_cached, set_cached, DEFAULT_TTL

    logger.info("Preloading cache in background...")

    async def preload_drone_tm():
        """Preload Drone TM centroids from production API."""
        try:
            drone_tm_url = settings.drone_tm_api_url
            cache_key = build_dronetm_cache_key(
                filter_by_owner=False, search=None, page=1, results_per_page=1000
            )

            if get_cached(cache_key):
                logger.info("Drone TM already cached")
                return

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    f"{drone_tm_url}/projects/centroids",
                    params={"filter_by_owner": "false", "page": 1, "results_per_page": 1000}
                )
                response.raise_for_status()
                data = response.json()
                if isinstance(data, list):
                    result = {"results": data, "pagination": {"page": 1, "per_page": 1000, "total": len(data)}}
                else:
                    result = data
                set_cached(cache_key, result, DEFAULT_TTL)
                results_count = len(result.get("results", [])) if isinstance(result, dict) else "N/A"
                logger.info("Drone TM preload complete: %s projects", results_count)
        except Exception as e:
            logger.warning("Drone TM preload failed (non-critical): %s", e)

    async def initial_oam_sync():
        """Sync OAM data into DB on startup if the table is empty."""
        from app.core.database import AsyncSessionLocal
        from app.services import oam_service

        try:
            async with AsyncSessionLocal() as db:
                if await oam_service.is_db_empty(db):
                    logger.info("OAM DB is empty - running initial sync from OAM API...")
                    await oam_service.sync_from_oam_api(db)
                else:
                    logger.info("OAM DB already populated - skipping initial sync")
        except Exception as e:
            logger.warning("OAM initial sync failed (non-critical): %s", e)

    async def preload_fair():
        """Preload fAIr model centroids and enrich with names."""
        try:
            cache_key = "fair_models_centroids"

            if get_cached(cache_key):
                logger.info("fAIr already cached")
                # Still run enrichment in case names aren't populated yet
                asyncio.create_task(enrich_fair_centroids_in_background())
                return

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{settings.fair_api_url}/models/centroid/",
                    headers={"accept": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                set_cached(cache_key, data, DEFAULT_TTL)
                features = data.get("features", []) if isinstance(data, dict) else []
                logger.info("fAIr preload complete: %s models", len(features))

                asyncio.create_task(enrich_fair_centroids_in_background())
        except Exception as e:
            logger.warning("fAIr preload failed (non-critical): %s", e)

    # Run all preloads in parallel (non-blocking)
    asyncio.create_task(fetch_and_enrich_in_background())  # Tasking Manager
    asyncio.create_task(preload_drone_tm())
    asyncio.create_task(initial_oam_sync())
    asyncio.create_task(preload_fair())

    # Start OAM DB sync scheduler (weekly background updates)
    start_sync_scheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    logger.info("Starting up...")

    auth_config = AuthConfig.from_env()
    logger.info("AuthConfig loaded: hanko_api_url=%s, jwt_issuer=%s", auth_config.hanko_api_url, auth_config.jwt_issuer)
    init_auth(auth_config)
    logger.info("Authentication initialized")

    # Preload cache in background (non-blocking)
    await preload_cache()

    # Start homepage map sync scheduler as managed FastAPI app task
    app.state.homepage_map_sync_task = asyncio.create_task(homepage_map_sync_loop())

    yield

    homepage_map_sync_task = getattr(app.state, "homepage_map_sync_task", None)
    if homepage_map_sync_task is not None:
        homepage_map_sync_task.cancel()
        try:
            await homepage_map_sync_task
        except asyncio.CancelledError:
            pass

    logger.info("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="Portal API with FastAPI and PostGIS support",
    docs_url=f"{settings.api_v1_prefix}/docs",
    redoc_url=f"{settings.api_v1_prefix}/redoc",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoints (K8s-ready)
@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """
    Basic health check endpoint.

    Returns service health status without dependencies.
    Used by Kubernetes liveness probe.

    Returns:
        dict: Health status
    """
    return {"status": "healthy"}


@app.get("/ready", tags=["health"])
async def ready() -> dict[str, str | bool]:
    """
    Readiness check endpoint.

    Checks if service is ready to accept traffic (includes DB check).
    Used by Kubernetes readiness probe.

    Returns:
        dict: Readiness status with database connection state
    """
    db_healthy = await check_db_connection()
    return {
        "status": "ready" if db_healthy else "not ready",
        "database": db_healthy,
    }


# ── User (authenticated) routers ─────────────────────────────────────────────
# Registered first so specific paths (e.g. /umap/user/maps) match before
# catch-all path parameters (e.g. /umap/{location}/{project_id}).

app.include_router(
    user_test.router,
    prefix=f"{settings.api_v1_prefix}/test",
    tags=["test"],
)

app.include_router(
    user_chatmap.router,
    prefix=settings.api_v1_prefix,
    tags=["chatmap"],
)

app.include_router(
    user_oam.router,
    prefix=settings.api_v1_prefix,
    tags=["open aerial map"],
)

app.include_router(
    user_drone_tm.router,
    prefix=settings.api_v1_prefix,
    tags=["drone tasking manager"],
)

app.include_router(
    user_fair.router,
    prefix=settings.api_v1_prefix,
    tags=["fair"],
)

app.include_router(
    user_umap.router,
    prefix=settings.api_v1_prefix,
    tags=["umap"],
)

app.include_router(
    user_export_tool.router,
    prefix=settings.api_v1_prefix,
    tags=["export tool"],
)

# ── Map (public) routers ─────────────────────────────────────────────────────

app.include_router(
    map_example.router,
    prefix=settings.api_v1_prefix,
    tags=["example"],
)

app.include_router(
    map_homepage_map.router,
    prefix=settings.api_v1_prefix,
    tags=["homepage map"],
)

app.include_router(
    map_tasking_manager.router,
    prefix=settings.api_v1_prefix,
    tags=["tasking manager"],
)

app.include_router(
    map_drone_tm.router,
    prefix=settings.api_v1_prefix,
    tags=["drone tasking manager"],
)

app.include_router(
    map_oam.router,
    prefix=settings.api_v1_prefix,
    tags=["open aerial map"],
)

app.include_router(
    map_fair.router,
    prefix=settings.api_v1_prefix,
    tags=["fair"],
)

app.include_router(
    map_field_tm.router,
    prefix=settings.api_v1_prefix,
    tags=["field tasking manager"],
)

app.include_router(
    map_umap.router,
    prefix=settings.api_v1_prefix,
    tags=["umap"],
)

app.include_router(
    map_export_tool.router,
    prefix=settings.api_v1_prefix,
    tags=["export tool"],
)

# Include authentication routers (OSM OAuth)
# Import here to avoid circular dependencies
from hotosm_auth_fastapi import osm_router

app.include_router(osm_router, prefix=settings.api_v1_prefix)

# Root endpoint
@app.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint.

    Returns:
        dict: Welcome message with API docs link
    """
    return {
        "message": "Welcome to Portal API",
        "docs": f"{settings.api_v1_prefix}/docs",
    }

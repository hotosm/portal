"""Main FastAPI application."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from hotosm_auth import AuthConfig
from hotosm_auth.integrations.fastapi import init_auth

from app.api.routes import example, test
from app.api.routes.tasking_manager import tasking_manager
from app.api.routes.drone_tasking_manager import drone_tasking_manager
from app.api.routes.open_aerial_map import open_aerial_map
from app.api.routes.fair import fair
from app.api.routes.field_tm import field_tm
from app.api.routes.umap import umap
from app.api.routes.export_tool import export_tool
from app.core.config import settings
from app.core.database import check_db_connection


async def preload_cache():
    """Preload cache with frequently accessed data on startup."""
    import httpx
    from app.api.routes.tasking_manager.tasking_manager import fetch_and_enrich_in_background
    from app.api.routes.fair.fair import enrich_fair_centroids_in_background
    from app.core.cache import get_cached, set_cached, DEFAULT_TTL

    print("🚀 Preloading cache in background...")

    async def preload_drone_tm():
        """Preload Drone TM centroids from production API."""
        try:
            # Use production URL directly (same as the endpoint)
            drone_tm_production_url = "https://dronetm.org/api"
            # Cache key must match: f"dronetm_centroids_{filter_by_owner}_{search}_{page}_{results_per_page}"
            # Frontend uses: /api/drone-tasking-manager/projects/centroids?results_per_page=1000
            cache_key = "dronetm_centroids_False_None_1_1000"

            if get_cached(cache_key):
                print("✅ Drone TM already cached")
                return

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    f"{drone_tm_production_url}/projects/centroids",
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
                print(f"✅ Drone TM preload complete: {results_count} projects")
        except Exception as e:
            print(f"⚠️ Drone TM preload failed (non-critical): {e}")

    async def preload_oam():
        """Preload Open Aerial Map projects."""
        try:
            # Cache key: f"oam_projects_{limit}_{page}_{sort}_{bbox}_{has_tiled}_{title}_{provider}_{gsd_from}_{gsd_to}_{acquisition_from}_{acquisition_to}"
            # Frontend uses: /api/open-aerial-map/projects?limit=100
            cache_key = "oam_projects_100_1_desc_None_None_None_None_None_None_None_None"

            if get_cached(cache_key):
                print("✅ OAM already cached")
                return

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    "https://api.openaerialmap.org/meta",
                    params={"limit": 100, "page": 1, "sort": "desc"}
                )
                response.raise_for_status()
                data = response.json()
                set_cached(cache_key, data, DEFAULT_TTL)
                print(f"✅ OAM preload complete: {len(data.get('results', []))} images")
        except Exception as e:
            print(f"⚠️ OAM preload failed (non-critical): {e}")

    async def preload_fair():
        """Preload fAIr model centroids and enrich with names."""
        try:
            cache_key = "fair_models_centroids"

            if get_cached(cache_key):
                print("✅ fAIr already cached")
                # Still run enrichment in case names aren't populated yet
                asyncio.create_task(enrich_fair_centroids_in_background())
                return

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    "https://api-prod.fair.hotosm.org/api/v1/models/centroid/",
                    headers={"accept": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                set_cached(cache_key, data, DEFAULT_TTL)
                features = data.get("features", []) if isinstance(data, dict) else []
                print(f"✅ fAIr preload complete: {len(features)} models")

                # Enrich with model names in background
                asyncio.create_task(enrich_fair_centroids_in_background())
        except Exception as e:
            print(f"⚠️ fAIr preload failed (non-critical): {e}")

    # Run all preloads in parallel (non-blocking)
    asyncio.create_task(fetch_and_enrich_in_background())  # Tasking Manager
    asyncio.create_task(preload_drone_tm())
    asyncio.create_task(preload_oam())
    asyncio.create_task(preload_fair())


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    print("Starting up...")

    # Initialize authentication from environment variables
    # This automatically configures JWT issuer validation
    print("🔧 Loading AuthConfig from environment...")
    auth_config = AuthConfig.from_env()
    print(f"🔧 AuthConfig loaded: hanko_api_url={auth_config.hanko_api_url}, jwt_issuer={auth_config.jwt_issuer}")
    init_auth(auth_config)
    print("Authentication initialized")

    # Preload cache in background (non-blocking)
    await preload_cache()

    yield
    # Shutdown
    print("Shutting down...")


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


# Include API routers
app.include_router(
    example.router,
    prefix=settings.api_v1_prefix,
    tags=["example"],
)

app.include_router(
    test.router,
    prefix=f"{settings.api_v1_prefix}/test",
    tags=["test"],
)

app.include_router(
    tasking_manager.router,
    prefix=settings.api_v1_prefix,
    tags=["tasking manager"],
)

app.include_router(
    drone_tasking_manager.router,
    prefix=settings.api_v1_prefix,
    tags=["drone tasking manager"],
)

app.include_router(
    open_aerial_map.router,
    prefix=settings.api_v1_prefix,
    tags=["open aerial map"],
)

app.include_router(
    fair.router,
    prefix=settings.api_v1_prefix,
    tags=["fair"],
)

app.include_router(
    field_tm.router,
    prefix=settings.api_v1_prefix,
    tags=["field tasking manager"],
)

app.include_router(
    umap.router,
    prefix=settings.api_v1_prefix,
    tags=["umap"],
)

app.include_router(
    export_tool.router,
    prefix=settings.api_v1_prefix,
    tags=["export tool"],
)

# Include authentication routers (OSM OAuth)
# Import here to avoid circular dependencies
from hotosm_auth.integrations.fastapi_osm_routes import router as osm_router

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

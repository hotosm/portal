"""Main FastAPI application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from hotosm_auth import AuthConfig
from hotosm_auth.integrations.fastapi import init_auth

from app.api.routes import example
from app.core.config import settings
from app.core.database import check_db_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    print("Starting up...")

    # Initialize authentication
    auth_config = AuthConfig(
        hanko_api_url=settings.hanko_api_url,
        cookie_secret=settings.cookie_secret,
        cookie_domain=settings.cookie_domain,
        osm_client_id=settings.osm_client_id,
        osm_client_secret=settings.osm_client_secret,
    )
    init_auth(auth_config)
    print("Authentication initialized")

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

# Include authentication routers (OSM OAuth)
# Import here to avoid circular dependencies
from hotosm_auth.integrations.fastapi_osm_routes import router as osm_router

app.include_router(osm_router)


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

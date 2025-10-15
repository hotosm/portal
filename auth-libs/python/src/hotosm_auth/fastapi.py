"""
FastAPI Integration - Ultra-Simplified API

Single import, single setup function, single dependency.

Example usage:
    from hotosm_auth.fastapi import setup_auth, Auth

    app = FastAPI()
    setup_auth(app)  # That's it!

    @app.get("/api/me")
    async def me(auth: Auth):
        return {"user": auth.user.email, "osm": auth.osm.osm_username if auth.osm else None}
"""

from typing import Optional, Annotated
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.integrations.fastapi import (
    init_auth as _init_auth,
    get_current_user,
    get_current_user_optional,
    get_osm_connection,
    get_config as _get_config,
)


class _AuthDep:
    """
    Internal dependency class for authentication.

    Provides:
    - auth.user: HankoUser (raises 401 if not authenticated)
    - auth.osm: Optional[OSMConnection]
    - auth.require_osm(): raises 403 if OSM not connected
    """

    def __init__(
        self,
        user: HankoUser = Depends(get_current_user),
        osm: Optional[OSMConnection] = Depends(get_osm_connection),
    ):
        self.user = user
        self.osm = osm

    def require_osm(self) -> OSMConnection:
        """
        Require OSM connection or raise 403.

        Usage:
            auth.require_osm()
            osm_api.upload(auth.osm.access_token)

        Raises:
            HTTPException: 403 if OSM not connected

        Returns:
            OSMConnection: The OSM connection
        """
        if not self.osm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="OSM connection required. Please connect your OSM account.",
            )
        return self.osm


# Type alias for main authentication dependency
Auth = Annotated[_AuthDep, Depends(_AuthDep)]


# Type alias for optional authentication
OptionalAuth = Annotated[Optional[HankoUser], Depends(get_current_user_optional)]


def setup_auth(
    app: FastAPI,
    config: Optional[AuthConfig] = None,
    auto_osm_routes: bool = True,
    cors_origins: Optional[list[str]] = None,
) -> None:
    """
    Setup HOTOSM authentication in one line.

    This function:
    - Loads configuration from environment variables (if not provided)
    - Initializes JWT validator and crypto
    - Adds CORS middleware for cookie support
    - Registers OSM OAuth routes (if OSM enabled)

    Usage:
        app = FastAPI()
        setup_auth(app)  # Reads from .env

    Or with custom config:
        config = AuthConfig(hanko_api_url="...", ...)
        setup_auth(app, config=config)

    Args:
        app: FastAPI application instance
        config: Optional AuthConfig. If None, loads from environment variables.
        auto_osm_routes: If True, automatically register OSM OAuth routes. Default: True.
        cors_origins: List of CORS origins. If None, uses ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:4000"]

    Environment variables (if config not provided):
        HANKO_API_URL: Hanko API URL (required)
        COOKIE_SECRET: Secret for encrypting cookies (required, min 32 bytes)
        COOKIE_DOMAIN: Cookie domain (optional, e.g., ".hotosm.org")
        COOKIE_SECURE: Use secure cookies (default: True)
        OSM_CLIENT_ID: OSM OAuth client ID (optional)
        OSM_CLIENT_SECRET: OSM OAuth client secret (optional)
        OSM_REDIRECT_URI: OSM OAuth redirect URI (optional)
        OSM_API_URL: OSM API URL (default: https://www.openstreetmap.org)

    Raises:
        ValueError: If required environment variables are missing
    """
    # Load config from environment if not provided
    if config is None:
        config = AuthConfig.from_env()

    # Initialize auth system
    _init_auth(config)

    # Add CORS middleware for cookie support
    if cors_origins is None:
        cors_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:4000",
            "http://localhost:5000",
            "http://localhost:8001",
        ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register OSM OAuth routes if enabled
    if auto_osm_routes and config.osm_enabled:
        from hotosm_auth.integrations.fastapi_osm_routes import router as osm_router
        app.include_router(osm_router)
        print(f"✅ OSM OAuth routes registered at /auth/osm/*")

    print(f"✅ HOTOSM Auth initialized (Hanko: {config.hanko_api_url})")


# Export commonly used items for convenience
__all__ = [
    "setup_auth",
    "Auth",
    "OptionalAuth",
    # Re-export from integrations for advanced users
    "get_current_user",
    "get_current_user_optional",
    "get_osm_connection",
]

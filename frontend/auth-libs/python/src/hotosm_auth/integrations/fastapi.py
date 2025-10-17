"""
FastAPI integration for hotosm-auth.

Provides:
- Dependency injection for HankoUser and OSMConnection
- Route decorators for protecting endpoints
- Response utilities for setting cookies

## Quick Start

1. Create a `.env` file with minimal configuration:

```bash
# Required
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-secret-key-min-32-bytes-long

# Optional - for OSM integration
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret

# ✨ Everything else is auto-detected!
# - COOKIE_DOMAIN: from HANKO_API_URL → ".hotosm.org"
# - COOKIE_SECURE: from HANKO_API_URL scheme → true (https)
# - OSM_REDIRECT_URI: auto-generated → "{HANKO_API_URL}/auth/osm/callback"
```

2. Initialize auth in your FastAPI app:

```python
from fastapi import FastAPI
from hotosm_auth import AuthConfig
from hotosm_auth.integrations.fastapi import init_auth

app = FastAPI()

# Auto-load from .env
config = AuthConfig.from_env()
init_auth(config)
```

3. Use dependency injection to protect routes:

```python
from hotosm_auth.integrations.fastapi import CurrentUser, OSMConnectionOptional

@app.get("/protected")
async def protected_route(
    user: CurrentUser,
    osm: OSMConnectionOptional,
):
    return {
        "user": user.email,
        "osm": osm.osm_username if osm else None,
    }
```

## Dependencies Available

- `CurrentUser` - Requires authentication, returns HankoUser
- `CurrentUserOptional` - Optional authentication, returns Optional[HankoUser]
- `OSMConnectionDep` - Optional OSM connection, returns Optional[OSMConnection]
- `OSMConnectionRequired` - Requires OSM connection, returns OSMConnection

## Example: Public Route (Optional Auth)

```python
from hotosm_auth.integrations.fastapi import CurrentUserOptional

@app.get("/public")
async def public_route(user: CurrentUserOptional):
    if user:
        return {"message": f"Hello {user.email}"}
    return {"message": "Hello anonymous"}
```

## Example: OSM Required Route

```python
from hotosm_auth.integrations.fastapi import CurrentUser, OSMConnectionRequired

@app.get("/osm-only")
async def osm_route(
    user: CurrentUser,
    osm: OSMConnectionRequired,
):
    return {"osm_username": osm.osm_username}
```

## Logging

Control log verbosity with the LOG_LEVEL environment variable:

```bash
LOG_LEVEL=DEBUG   # Show all debug messages
LOG_LEVEL=INFO    # Show info and above
LOG_LEVEL=WARNING # Show warnings and errors only (default)
LOG_LEVEL=ERROR   # Show errors only
```
"""

from typing import Optional, Annotated
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.jwt_validator import JWTValidator
from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import (
    AuthenticationError,
    TokenExpiredError,
    TokenInvalidError,
    CookieDecryptionError,
)
from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


# Global instances (set by init_auth)
_config: Optional[AuthConfig] = None
_jwt_validator: Optional[JWTValidator] = None
_cookie_crypto: Optional[CookieCrypto] = None

# Security scheme for Swagger UI
bearer_scheme = HTTPBearer(auto_error=False)


def init_auth(config: AuthConfig) -> None:
    """Initialize authentication for FastAPI app.

    Call this once at app startup:

        app = FastAPI()
        config = AuthConfig(...)
        init_auth(config)

    Args:
        config: Authentication configuration
    """
    global _config, _jwt_validator, _cookie_crypto

    _config = config
    _jwt_validator = JWTValidator(config)
    _cookie_crypto = CookieCrypto(config.cookie_secret)


def get_config() -> AuthConfig:
    """Get authentication configuration (dependency)."""
    if _config is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _config


def get_jwt_validator() -> JWTValidator:
    """Get JWT validator (dependency)."""
    if _jwt_validator is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _jwt_validator


def get_cookie_crypto() -> CookieCrypto:
    """Get cookie crypto (dependency)."""
    if _cookie_crypto is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _cookie_crypto


async def get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[str]:
    """Extract JWT token from cookie or Authorization header.

    Priority:
    1. Authorization header (Bearer token)
    2. hanko cookie

    Args:
        request: FastAPI request
        credentials: Bearer token from Authorization header

    Returns:
        str: JWT token or None
    """
    # Try Authorization header first
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    # Try cookie
    token = request.cookies.get("hanko")
    return token


async def get_current_user(
    request: Request,
    validator: JWTValidator = Depends(get_jwt_validator),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> HankoUser:
    """Get currently authenticated user (dependency).

    Validates JWT token and returns HankoUser.
    Raises HTTPException if authentication fails.

    Usage:
        @app.get("/protected")
        async def protected_route(user: HankoUser = Depends(get_current_user)):
            return {"user_id": user.id, "email": user.email}

    Args:
        request: FastAPI request
        validator: JWT validator
        credentials: Bearer token

    Returns:
        HankoUser: Authenticated user

    Raises:
        HTTPException: 401 if authentication fails
    """
    token = await get_token_from_request(request, credentials)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = await validator.validate_token(token)
        return user
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (TokenInvalidError, AuthenticationError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    request: Request,
    validator: JWTValidator = Depends(get_jwt_validator),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[HankoUser]:
    """Get current user if authenticated, None otherwise.

    Like get_current_user but doesn't raise exception if not authenticated.

    Usage:
        @app.get("/optional-auth")
        async def route(user: Optional[HankoUser] = Depends(get_current_user_optional)):
            if user:
                return {"message": f"Hello {user.email}"}
            return {"message": "Hello anonymous"}

    Args:
        request: FastAPI request
        validator: JWT validator
        credentials: Bearer token

    Returns:
        HankoUser or None
    """
    token = await get_token_from_request(request, credentials)

    if not token:
        return None

    try:
        user = await validator.validate_token(token)
        return user
    except (TokenExpiredError, TokenInvalidError, AuthenticationError):
        return None


async def get_osm_connection(
    request: Request,
    crypto: CookieCrypto = Depends(get_cookie_crypto),
) -> Optional[OSMConnection]:
    """Get OSM connection from encrypted cookie (dependency).

    Returns None if no OSM connection cookie found or decryption fails.

    Usage:
        @app.get("/osm-protected")
        async def route(
            user: HankoUser = Depends(get_current_user),
            osm: OSMConnection = Depends(require_osm_connection),
        ):
            return {"osm_username": osm.osm_username}

    Args:
        request: FastAPI request
        crypto: Cookie crypto

    Returns:
        OSMConnection or None
    """
    encrypted = request.cookies.get("osm_connection")

    print(f"🔍 Looking for OSM connection cookie: found={encrypted is not None}")
    print(f"🔍 All cookies present: {list(request.cookies.keys())}")
    if encrypted:
        print(f"🔍 Cookie value (first 50 chars): {encrypted[:50]}...")

    if not encrypted:
        print("❌ No OSM cookie found, returning None")
        return None

    try:
        print("🔓 Attempting to decrypt OSM cookie...")
        osm = crypto.decrypt_osm_connection(encrypted)
        print(f"✅ OSM connection decrypted successfully: {osm.osm_username}")
        return osm
    except CookieDecryptionError as e:
        print(f"❌ OSM cookie decryption failed: {e}")
        return None


async def require_osm_connection(
    osm: Optional[OSMConnection] = Depends(get_osm_connection),
) -> OSMConnection:
    """Require OSM connection (dependency).

    Like get_osm_connection but raises HTTPException if not connected.

    Usage:
        @app.get("/osm-required")
        async def route(osm: OSMConnection = Depends(require_osm_connection)):
            return {"osm_username": osm.osm_username}

    Args:
        osm: OSM connection from cookie

    Returns:
        OSMConnection

    Raises:
        HTTPException: 403 if OSM not connected
    """
    if not osm:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OSM connection required",
        )
    return osm


def set_osm_cookie(
    response: Response,
    osm_connection: OSMConnection,
    config: AuthConfig,
    crypto: CookieCrypto,
) -> None:
    """Set encrypted OSM connection cookie on response.

    Usage:
        @app.get("/auth/osm/callback")
        async def osm_callback(
            response: Response,
            config: AuthConfig = Depends(get_config),
            crypto: CookieCrypto = Depends(get_cookie_crypto),
        ):
            # ... OSM OAuth flow ...
            osm_conn = OSMConnection(...)
            set_osm_cookie(response, osm_conn, config, crypto)
            return {"success": True}

    Args:
        response: FastAPI response
        osm_connection: OSM connection data to encrypt
        config: Auth configuration
        crypto: Cookie crypto
    """
    encrypted = crypto.encrypt_osm_connection(osm_connection)

    # Calculate max_age from expires_at
    max_age = None
    if osm_connection.expires_at:
        delta = osm_connection.expires_at - datetime.utcnow()
        max_age = int(delta.total_seconds())

    logger.debug(
        f"Setting OSM cookie: domain={config.cookie_domain}, "
        f"secure={config.cookie_secure}, samesite={config.cookie_samesite}"
    )

    response.set_cookie(
        key="osm_connection",
        value=encrypted,
        httponly=True,
        secure=config.cookie_secure,
        samesite=config.cookie_samesite,
        domain=config.cookie_domain,
        max_age=max_age,
        path="/",
    )


def clear_osm_cookie(
    response: Response,
    config: AuthConfig,
) -> None:
    """Clear OSM connection cookie from response.

    Usage:
        @app.post("/auth/osm/disconnect")
        async def disconnect_osm(
            response: Response,
            config: AuthConfig = Depends(get_config),
        ):
            clear_osm_cookie(response, config)
            return {"success": True}

    Args:
        response: FastAPI response
        config: Auth configuration
    """
    # Use set_cookie with max_age=0 instead of delete_cookie
    # This is more reliable for httpOnly cookies
    response.set_cookie(
        key="osm_connection",
        value="",
        httponly=True,
        secure=config.cookie_secure,
        samesite=config.cookie_samesite,
        domain=config.cookie_domain,
        max_age=0,
        path="/",
    )

    # Also clear without domain for old cookies
    if config.cookie_domain:
        response.set_cookie(
            key="osm_connection",
            value="",
            httponly=True,
            secure=config.cookie_secure,
            samesite=config.cookie_samesite,
            max_age=0,
            path="/",
        )


# Type aliases for cleaner dependency injection
CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
CurrentUserOptional = Annotated[Optional[HankoUser], Depends(get_current_user_optional)]
OSMConnectionDep = Annotated[Optional[OSMConnection], Depends(get_osm_connection)]
OSMConnectionRequired = Annotated[OSMConnection, Depends(require_osm_connection)]

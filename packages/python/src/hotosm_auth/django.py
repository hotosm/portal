"""
Django Integration - Ultra-Simplified API

Environment-first configuration, simple decorators, auto namespace.

Example usage:
    # settings.py (no HOTOSM_AUTH dict needed!)
    MIDDLEWARE = ['hotosm_auth.django.HankoAuthMiddleware']

    # views.py
    from hotosm_auth.django import auth_required

    @auth_required
    def my_view(request):
        user = request.hotosm.user
        osm = request.hotosm.osm
        return JsonResponse({"user": user.email})
"""

from typing import Optional, Callable
from functools import wraps

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils.functional import SimpleLazyObject

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


# Global instances (initialized from environment)
_config: Optional[AuthConfig] = None
_jwt_validator: Optional[JWTValidator] = None
_cookie_crypto: Optional[CookieCrypto] = None


class HOTOSMAuth:
    """
    Namespace for auth data on request object.

    Attached by HankoAuthMiddleware to every request as `request.hotosm`.

    Usage:
        def my_view(request):
            if request.hotosm.user:
                print(f"User: {request.hotosm.user.email}")

            if request.hotosm.osm:
                print(f"OSM: {request.hotosm.osm.osm_username}")

            # Or require OSM
            osm = request.hotosm.require_osm()
    """

    def __init__(self, user: Optional[HankoUser], osm: Optional[OSMConnection]):
        self.user = user
        self.osm = osm

    def require_osm(self) -> OSMConnection:
        """
        Require OSM connection or raise exception.

        Usage:
            def my_view(request):
                osm = request.hotosm.require_osm()
                # Use osm.access_token for API calls

        Raises:
            ValueError: If OSM not connected

        Returns:
            OSMConnection: The OSM connection
        """
        if not self.osm:
            raise ValueError("OSM connection required")
        return self.osm


def _get_auth_config() -> AuthConfig:
    """Get or create authentication configuration from environment."""
    global _config

    if _config is None:
        try:
            _config = AuthConfig.from_env()
        except ValueError as e:
            raise ValueError(
                f"Failed to load HOTOSM auth configuration: {e}\n"
                "Make sure to set HANKO_API_URL and COOKIE_SECRET in your environment or .env file."
            )

    return _config


def _get_jwt_validator() -> JWTValidator:
    """Get or create JWT validator singleton."""
    global _jwt_validator

    if _jwt_validator is None:
        config = _get_auth_config()
        _jwt_validator = JWTValidator(config)

    return _jwt_validator


def _get_cookie_crypto() -> CookieCrypto:
    """Get or create cookie crypto singleton."""
    global _cookie_crypto

    if _cookie_crypto is None:
        config = _get_auth_config()
        _cookie_crypto = CookieCrypto(config.cookie_secret)

    return _cookie_crypto


def _get_token_from_request(request: HttpRequest) -> Optional[str]:
    """Extract JWT token from request."""
    # Try Authorization header first
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]

    # Try cookie
    return request.COOKIES.get("hanko")


async def _get_current_user_async(request: HttpRequest) -> Optional[HankoUser]:
    """Get authenticated user from request (async)."""
    token = _get_token_from_request(request)

    if not token:
        print(f"🔒 No JWT token found in request to {request.path}")
        return None

    try:
        validator = _get_jwt_validator()
        config = _get_auth_config()
        print(f"🔑 Validating JWT for {request.path}")
        print(f"   JWT Audience configured: {config.jwt_audience}")
        print(f"   JWT Issuer configured: {config.jwt_issuer}")
        print(f"   Token: {token[:50]}...")
        user = await validator.validate_token(token)
        print(f"✅ JWT validation successful for {user.email}")
        return user
    except (TokenExpiredError, TokenInvalidError, AuthenticationError) as e:
        print(f"❌ JWT validation failed for {request.path}: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return None
    except Exception as e:
        print(f"❌ Unexpected error during JWT validation for {request.path}: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return None


def _get_current_user_sync(request: HttpRequest) -> Optional[HankoUser]:
    """Get authenticated user from request (sync wrapper)."""
    import asyncio

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_get_current_user_async(request))


def _get_osm_connection(request: HttpRequest) -> Optional[OSMConnection]:
    """Get OSM connection from encrypted cookie."""
    encrypted = request.COOKIES.get("osm_connection")

    if not encrypted:
        return None

    try:
        crypto = _get_cookie_crypto()
        return crypto.decrypt_osm_connection(encrypted)
    except CookieDecryptionError:
        return None


class HankoAuthMiddleware:
    """
    Django middleware for automatic JWT validation.

    Adds `request.hotosm.user` and `request.hotosm.osm` to all requests.

    Installation:
        # settings.py
        MIDDLEWARE = [
            ...
            'hotosm_auth.django.HankoAuthMiddleware',
        ]

    Usage in views:
        def my_view(request):
            if request.hotosm.user:
                return HttpResponse(f"Hello {request.hotosm.user.email}")

            if request.hotosm.osm:
                return HttpResponse(f"OSM: {request.hotosm.osm.osm_username}")

            return HttpResponse("Not authenticated")

    Or with decorator:
        from hotosm_auth.django import auth_required

        @auth_required
        def my_view(request):
            # request.hotosm.user is guaranteed to exist
            return HttpResponse(f"Hello {request.hotosm.user.email}")
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        """Add auth namespace to request."""
        # Create lazy-loaded auth namespace
        request.hotosm = SimpleLazyObject(
            lambda: HOTOSMAuth(
                user=_get_current_user_sync(request),
                osm=_get_osm_connection(request),
            )
        )

        return self.get_response(request)


def auth_required(view_func: Callable) -> Callable:
    """
    Decorator to require Hanko authentication.

    Usage:
        from hotosm_auth.django import auth_required

        @auth_required
        def my_view(request):
            # request.hotosm.user is guaranteed to exist
            return HttpResponse(f"Hello {request.hotosm.user.email}")

    Returns 401 if not authenticated.

    Args:
        view_func: View function to decorate

    Returns:
        Wrapped view function
    """
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        if not hasattr(request, "hotosm") or not request.hotosm.user:
            return JsonResponse(
                {"error": "Authentication required"},
                status=401,
            )
        return view_func(request, *args, **kwargs)

    return wrapper


def require_osm(view_func: Callable) -> Callable:
    """
    Decorator to require OSM connection.

    Usage:
        from hotosm_auth.django import auth_required, require_osm

        @auth_required
        @require_osm
        def my_view(request):
            # request.hotosm.osm is guaranteed to exist
            return HttpResponse(f"OSM: {request.hotosm.osm.osm_username}")

    Returns 403 if OSM not connected.

    Args:
        view_func: View function to decorate

    Returns:
        Wrapped view function
    """
    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        if not hasattr(request, "hotosm") or not request.hotosm.osm:
            return JsonResponse(
                {"error": "OSM connection required"},
                status=403,
            )
        return view_func(request, *args, **kwargs)

    return wrapper


# Re-export for compatibility with old API
login_required = auth_required
osm_required = require_osm


# Export main items
__all__ = [
    "HankoAuthMiddleware",
    "HOTOSMAuth",
    "auth_required",
    "require_osm",
    # Aliases for compatibility
    "login_required",
    "osm_required",
]

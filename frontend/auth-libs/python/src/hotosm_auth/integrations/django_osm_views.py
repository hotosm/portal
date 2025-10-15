"""
Django OSM OAuth views.

Provides ready-to-use views for OSM OAuth 2.0 flow in Django apps.

Routes:
    GET  /auth/osm/login - Start OSM OAuth flow
    GET  /auth/osm/callback - Handle OSM OAuth callback
    GET  /auth/osm/status - Check OSM connection status
    POST /auth/osm/disconnect - Disconnect OSM account

Usage:
    # urls.py
    from hotosm_auth.integrations import django_osm_views

    urlpatterns = [
        path('', include(django_osm_views.urlpatterns)),
    ]
"""

import asyncio
import secrets
from typing import Optional

from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.urls import path

from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.osm_oauth import OSMOAuthClient
from hotosm_auth.exceptions import OSMOAuthError, AuthenticationError
from hotosm_auth.integrations.django import (
    get_current_user,
    get_osm_connection,
    set_osm_cookie,
    clear_osm_cookie,
    get_auth_config,
)
from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


# In-memory state storage (use Redis in production)
# TODO: Make this configurable to use Redis
# Format: {state: {"user_id": str, "redirect_url": str}}
_oauth_states = {}


@require_http_methods(["GET"])
def osm_login(request: HttpRequest):
    """
    Start OSM OAuth flow.

    Requires Hanko authentication first.
    Redirects to OSM authorization page.

    Usage:
        <a href="/auth/osm/login">Connect OSM</a>

    Or from the web component:
        <hotosm-auth osm-enabled="true"></hotosm-auth>
    """
    # Get current user from middleware (requires Hanko authentication)
    # The HankoAuthMiddleware adds request.hotosm.user automatically
    logger.debug(f"OSM login called for {request.path}")
    logger.debug(f"Has hotosm attribute: {hasattr(request, 'hotosm')}")

    user: Optional[HankoUser] = None
    if hasattr(request, 'hotosm') and request.hotosm:
        logger.debug(f"Accessing request.hotosm.user...")
        user = request.hotosm.user
        logger.debug(f"User: {user}")

    if not user:
        logger.warning("No authenticated user found for OSM login")
        return JsonResponse(
            {"error": "Authentication required"},
            status=401,
        )

    config = get_auth_config()

    if not config.osm_enabled:
        return JsonResponse(
            {"error": "OSM OAuth is not enabled"},
            status=400,
        )

    # Create OSM OAuth client
    osm_client = OSMOAuthClient(config)

    # Generate random state for CSRF protection
    state = secrets.token_urlsafe(32)

    # Store user ID and the page they came from for redirect after OAuth
    referer = request.META.get('HTTP_REFERER', '')
    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        # Store the full path (including query params if any)
        redirect_url = parsed.path
        if parsed.query:
            redirect_url += '?' + parsed.query
    else:
        # Fallback to current app's base path
        redirect_url = request.path.rsplit('/auth/osm/login', 1)[0] or '/'

    _oauth_states[state] = {
        "user_id": user.id,
        "redirect_url": redirect_url
    }

    # Generate authorization URL
    auth_url = osm_client.get_authorization_url(state=state)

    return redirect(auth_url)


@require_http_methods(["GET"])
def osm_callback(request: HttpRequest):
    """
    Handle OSM OAuth callback.

    OSM redirects here after user authorizes.
    Exchanges code for token and stores in httpOnly cookie.

    This route is called automatically by OSM after authorization.
    """
    code = request.GET.get("code")
    state = request.GET.get("state")

    if not code or not state:
        return JsonResponse(
            {"error": "Missing code or state parameter"},
            status=400,
        )

    # Get current user from middleware
    user: Optional[HankoUser] = None
    if hasattr(request, 'hotosm') and request.hotosm:
        user = request.hotosm.user

    if not user:
        return JsonResponse(
            {"error": "Authentication required"},
            status=401,
        )

    config = get_auth_config()

    if not config.osm_enabled:
        return JsonResponse(
            {"error": "OSM OAuth is not enabled"},
            status=400,
        )

    # Verify state (CSRF protection)
    state_data = _oauth_states.pop(state, None)
    if not state_data:
        return JsonResponse(
            {"error": "Invalid OAuth state"},
            status=400,
        )

    # Handle both old format (just user_id string) and new format (dict)
    if isinstance(state_data, dict):
        stored_user_id = state_data.get("user_id")
        redirect_url = state_data.get("redirect_url", "/")
    else:
        # Legacy format: just user_id
        stored_user_id = state_data
        redirect_url = "/"

    if stored_user_id != user.id:
        return JsonResponse(
            {"error": "Invalid OAuth state"},
            status=400,
        )

    try:
        # Create OSM OAuth client
        osm_client = OSMOAuthClient(config)

        # Get or create event loop
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # Exchange code for tokens (async call)
        osm_connection: OSMConnection = loop.run_until_complete(
            osm_client.exchange_code(code)
        )

        # Redirect back to the page stored in state during login
        # (redirect_url was already extracted from state_data above)
        response = redirect(redirect_url)

        # Set encrypted cookie
        set_osm_cookie(response, osm_connection)

        return response

    except OSMOAuthError as e:
        return JsonResponse(
            {"error": f"OSM OAuth failed: {str(e)}"},
            status=400,
        )


@require_http_methods(["GET"])
def osm_status(request: HttpRequest):
    """
    Check OSM connection status.

    Returns connection details if connected, or {connected: false} if not.

    Usage:
        const response = await fetch('/auth/osm/status', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.connected) {
            console.log('OSM user:', data.osm_username);
        }

    Returns:
        {
            "connected": true,
            "osm_user_id": 12345,
            "osm_username": "mapper123",
            "osm_avatar_url": "https://..."
        }

        or

        {"connected": false}
    """
    osm: Optional[OSMConnection] = get_osm_connection(request)

    if not osm:
        return JsonResponse({"connected": False})

    return JsonResponse({
        "connected": True,
        "osm_user_id": osm.osm_user_id,
        "osm_username": osm.osm_username,
        "osm_avatar_url": osm.osm_avatar_url,
    })


@csrf_exempt
@require_http_methods(["POST"])
def osm_disconnect(request: HttpRequest):
    """
    Disconnect OSM account.

    Removes OSM connection cookie.
    User can reconnect later via /auth/osm/login.

    Note: This endpoint does NOT require authentication because it's called
    during logout when the JWT may have already been cleared.

    Usage:
        const response = await fetch('/auth/osm/disconnect', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            console.log('OSM disconnected');
        }

    Returns:
        {"status": "disconnected"}
    """
    logger.debug(f"OSM disconnect called for {request.path}")

    # Don't require authentication - just clear the OSM cookie
    # This allows logout to work even if Hanko JWT is already cleared
    response = JsonResponse({"status": "disconnected"})
    clear_osm_cookie(response)

    logger.debug("OSM cookie cleared, response ready to send")

    return response


# URL patterns for easy inclusion in Django apps
urlpatterns = [
    path('auth/osm/login/', osm_login, name='osm_login'),
    path('auth/osm/callback/', osm_callback, name='osm_callback'),
    path('auth/osm/status/', osm_status, name='osm_status'),
    path('auth/osm/disconnect/', osm_disconnect, name='osm_disconnect'),
]

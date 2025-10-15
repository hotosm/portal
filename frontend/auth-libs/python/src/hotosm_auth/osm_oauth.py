"""
OpenStreetMap OAuth 2.0 integration.

Handles the OAuth flow for connecting OSM accounts:
1. Generate authorization URL
2. Exchange code for tokens
3. Fetch user profile
4. Refresh tokens
"""

from typing import Optional
from datetime import datetime, timedelta
from urllib.parse import urlencode

import httpx

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import OSMConnection
from hotosm_auth.exceptions import OSMOAuthError, OSMAPIError


class OSMOAuthClient:
    """Client for OSM OAuth 2.0 flow.

    Example:
        client = OSMOAuthClient(config)

        # Step 1: Generate authorization URL
        auth_url = client.get_authorization_url(state="random_state")
        # Redirect user to auth_url

        # Step 2: Exchange code for tokens
        osm_conn = await client.exchange_code("authorization_code")

        # Step 3: Use the connection
        profile = await client.get_user_profile(osm_conn.access_token)
    """

    def __init__(self, config: AuthConfig):
        """Initialize OSM OAuth client.

        Args:
            config: Authentication configuration

        Raises:
            ValueError: If OSM not enabled in config
        """
        if not config.osm_enabled:
            raise ValueError("OSM OAuth not enabled in configuration")

        self.config = config
        self.osm_api_url = str(config.osm_api_url).rstrip("/")
        self.client_id = config.osm_client_id
        self.client_secret = config.osm_client_secret
        self.redirect_uri = config.osm_redirect_uri
        self.scopes = config.osm_scopes

        # OAuth endpoints
        self.authorize_url = f"{self.osm_api_url}/oauth2/authorize"
        self.token_url = f"{self.osm_api_url}/oauth2/token"
        self.user_details_url = f"{self.osm_api_url}/api/0.6/user/details.json"

    def get_authorization_url(
        self,
        state: str,
        scopes: Optional[list[str]] = None,
    ) -> str:
        """Generate OAuth authorization URL.

        Args:
            state: Random state parameter for CSRF protection
            scopes: OAuth scopes (defaults to config.osm_scopes)

        Returns:
            str: Authorization URL to redirect user to

        Example:
            state = secrets.token_urlsafe(32)
            auth_url = client.get_authorization_url(state)
            # Redirect user to auth_url
        """
        if scopes is None:
            scopes = self.scopes

        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": " ".join(scopes),
            "state": state,
        }

        return f"{self.authorize_url}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> OSMConnection:
        """Exchange authorization code for access token.

        Args:
            code: Authorization code from OAuth callback

        Returns:
            OSMConnection: Connection with access token and user data

        Raises:
            OSMOAuthError: If token exchange fails
        """
        async with httpx.AsyncClient() as client:
            try:
                # Exchange code for tokens
                token_response = await client.post(
                    self.token_url,
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "redirect_uri": self.redirect_uri,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    },
                    headers={"Accept": "application/json"},
                )
                token_response.raise_for_status()
                token_data = token_response.json()

                access_token = token_data.get("access_token")
                refresh_token = token_data.get("refresh_token")
                expires_in = token_data.get("expires_in")  # seconds

                if not access_token:
                    raise OSMOAuthError("No access_token in token response")

                # Calculate expiration
                expires_at = None
                if expires_in:
                    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

                # Get user profile
                user_data = await self._get_user_details(access_token)

                # Extract granted scopes
                granted_scopes = token_data.get("scope", "").split()

                return OSMConnection(
                    osm_user_id=user_data["id"],
                    osm_username=user_data["display_name"],
                    osm_avatar_url=user_data.get("img", {}).get("href"),
                    access_token=access_token,
                    refresh_token=refresh_token,
                    expires_at=expires_at,
                    scopes=granted_scopes,
                )

            except httpx.HTTPStatusError as e:
                raise OSMOAuthError(
                    f"Token exchange failed: {e.response.status_code} {e.response.text}"
                ) from e
            except httpx.RequestError as e:
                raise OSMOAuthError(f"Token exchange request failed: {str(e)}") from e
            except KeyError as e:
                raise OSMOAuthError(f"Invalid user data response: {str(e)}") from e

    async def refresh_access_token(
        self,
        refresh_token: str,
    ) -> OSMConnection:
        """Refresh an expired access token.

        Args:
            refresh_token: Refresh token from previous connection

        Returns:
            OSMConnection: New connection with refreshed token

        Raises:
            OSMOAuthError: If token refresh fails
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.token_url,
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    },
                    headers={"Accept": "application/json"},
                )
                response.raise_for_status()
                token_data = response.json()

                access_token = token_data.get("access_token")
                new_refresh_token = token_data.get("refresh_token", refresh_token)
                expires_in = token_data.get("expires_in")

                if not access_token:
                    raise OSMOAuthError("No access_token in refresh response")

                expires_at = None
                if expires_in:
                    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

                # Get updated user profile
                user_data = await self._get_user_details(access_token)

                granted_scopes = token_data.get("scope", "").split()

                return OSMConnection(
                    osm_user_id=user_data["id"],
                    osm_username=user_data["display_name"],
                    osm_avatar_url=user_data.get("img", {}).get("href"),
                    access_token=access_token,
                    refresh_token=new_refresh_token,
                    expires_at=expires_at,
                    scopes=granted_scopes,
                )

            except httpx.HTTPStatusError as e:
                raise OSMOAuthError(
                    f"Token refresh failed: {e.response.status_code}"
                ) from e
            except httpx.RequestError as e:
                raise OSMOAuthError(f"Token refresh request failed: {str(e)}") from e

    async def _get_user_details(self, access_token: str) -> dict:
        """Fetch user profile from OSM API.

        Args:
            access_token: OSM OAuth access token

        Returns:
            dict: User profile data

        Raises:
            OSMAPIError: If API request fails
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.user_details_url,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json",
                    },
                )
                response.raise_for_status()
                data = response.json()

                # OSM returns: {"version": "0.6", "user": {...}}
                user = data.get("user")
                if not user:
                    raise OSMAPIError("No user data in API response")

                return user

            except httpx.HTTPStatusError as e:
                raise OSMAPIError(
                    f"OSM API error: {e.response.status_code}"
                ) from e
            except httpx.RequestError as e:
                raise OSMAPIError(f"OSM API request failed: {str(e)}") from e

    async def get_user_profile(self, access_token: str) -> dict:
        """Get user profile (public method).

        Args:
            access_token: OSM OAuth access token

        Returns:
            dict: User profile with id, display_name, img, etc.
        """
        return await self._get_user_details(access_token)


async def make_osm_api_request(
    osm_connection: OSMConnection,
    method: str,
    endpoint: str,
    osm_api_url: str = "https://www.openstreetmap.org",
    **kwargs,
) -> dict:
    """Make an authenticated request to OSM API.

    Utility function for making OSM API calls with a connection.

    Args:
        osm_connection: OSM connection with access token
        method: HTTP method (GET, POST, PUT, DELETE)
        endpoint: API endpoint (e.g., "/api/0.6/user/details.json")
        osm_api_url: OSM API base URL
        **kwargs: Additional arguments for httpx.request()

    Returns:
        dict: JSON response

    Raises:
        OSMAPIError: If request fails

    Example:
        profile = await make_osm_api_request(
            osm_conn,
            "GET",
            "/api/0.6/user/details.json"
        )
    """
    url = f"{osm_api_url.rstrip('/')}{endpoint}"

    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"Bearer {osm_connection.access_token}"
    headers["Accept"] = "application/json"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method,
                url,
                headers=headers,
                **kwargs,
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            raise OSMAPIError(
                f"OSM API error: {e.response.status_code} {e.response.text}"
            ) from e
        except httpx.RequestError as e:
            raise OSMAPIError(f"OSM API request failed: {str(e)}") from e

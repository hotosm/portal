"""Test endpoints for authentication integration.

These endpoints demonstrate the hotosm-auth integration:
- Hanko JWT validation from cookies
- OSM connection validation from encrypted cookies
"""

from fastapi import APIRouter

from hotosm_auth.integrations.fastapi import CurrentUser, OSMConnectionRequired
from app.schemas.auth import UserInfoResponse, OSMInfoResponse

router = APIRouter()


@router.get("/me", response_model=UserInfoResponse)
async def test_user_auth(user: CurrentUser) -> UserInfoResponse:
    """
    Test endpoint requiring Hanko authentication.

    Returns authenticated user information from JWT.

    **Authentication**: Requires valid Hanko session (JWT in cookie or Bearer token)

    **Returns**:
    - 200: User information
    - 401: Not authenticated

    **Example**:
    ```bash
    curl http://localhost:8000/api/test/me \
      -H "Cookie: hanko=YOUR_JWT_TOKEN"
    ```
    """
    return UserInfoResponse(
        message="You are logged in",
        user_id=user.id,
        email=user.email,
        username=user.username,
    )


@router.get("/osm", response_model=OSMInfoResponse)
async def test_osm_auth(
    user: CurrentUser,
    osm: OSMConnectionRequired,
) -> OSMInfoResponse:
    """
    Test endpoint requiring both Hanko authentication and OSM connection.

    Returns OSM connection information from encrypted cookie.

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie or Bearer token)
    - Requires OSM connection (encrypted cookie from OAuth flow)

    **Returns**:
    - 200: OSM connection information
    - 401: Not authenticated (no valid Hanko session)
    - 403: OSM connection required (logged in but not connected to OSM)

    **Example**:
    ```bash
    curl http://localhost:8000/api/test/osm \
      -H "Cookie: hanko=YOUR_JWT_TOKEN; osm_connection=YOUR_ENCRYPTED_TOKEN"
    ```

    **Note**: To connect OSM, visit `/api/auth/osm/login` after logging in with Hanko.
    """
    return OSMInfoResponse(
        message="You are connected to OSM",
        osm_user_id=osm.osm_user_id,
        osm_username=osm.osm_username,
        osm_avatar_url=osm.osm_avatar_url,
    )

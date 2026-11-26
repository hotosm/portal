"""Test endpoints for authentication integration.

These endpoints demonstrate the hotosm-auth integration:
- Hanko JWT validation from cookies
"""

from fastapi import APIRouter

from hotosm_auth_fastapi import AdminUser
from app.schemas.auth import UserInfoResponse

router = APIRouter()


@router.get("/me", response_model=UserInfoResponse)
async def test_user_auth(user: AdminUser) -> UserInfoResponse:
    """
    Test endpoint requiring Hanko authentication and admin access.

    Returns authenticated user information from JWT.

    **Authentication**:
    - Requires valid Hanko session (JWT in cookie or Bearer token)
    - Requires the user's email to be in ADMIN_EMAILS

    **Returns**:
    - 200: User information
    - 401: Not authenticated
    - 403: Not an admin

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

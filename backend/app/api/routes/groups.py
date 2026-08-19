"""Group membership proxy for the plan scope selector.

Portal doesn't own group data — it asks login (forwarding the hanko cookie).
Exposed to the frontend so the "is this plan personal / a team / an org?"
selector can list the groups the user belongs to.
"""

from fastapi import APIRouter, Request
from hotosm_auth_fastapi import CurrentUser

from app.services import login_service

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("")
async def list_my_groups(user: CurrentUser, request: Request) -> dict:
    """List the groups the current user belongs to (proxied from login).

    Returns ``{"groups": [...]}``. If login is unavailable, returns an empty
    list so the UI can still offer a personal plan.
    """
    try:
        groups = await login_service.get_user_groups(
            user.id, request.cookies.get("hanko")
        )
    except login_service.LoginUnavailable:
        return {"groups": [], "degraded": True}
    return {
        "groups": [
            {
                "id": g.id,
                "type": g.type,
                "slug": g.slug,
                "name": g.name,
                "role": g.role,
                "status": g.status,
            }
            for g in groups
        ]
    }

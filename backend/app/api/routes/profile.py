"""Profile API endpoints — portal-owned profile extras merged with login's account data.

Account identity (name, picture, slug, is_public) lives in login; portal asks
for it live on every request and never mirrors it locally.
"""

from fastapi import APIRouter, Depends, HTTPException
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.profile import PortalProfileRead, ProfileMeRead, ProfilePatch, PublicProfileRead
from app.services import login_service, profile_service

router = APIRouter(prefix="/profile", tags=["profile"])
public_router = APIRouter(prefix="/public/profile", tags=["profile"])


@router.get("/me", response_model=ProfileMeRead)
async def get_my_profile(user: CurrentUser, db: AsyncSession = Depends(get_db)) -> ProfileMeRead:
    """Return the current user's account fields (from login) plus portal fields."""
    try:
        profile = await profile_service.get_merged_profile(db, user.id)
    except login_service.LoginUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me", response_model=PortalProfileRead)
async def update_my_profile(
    payload: ProfilePatch,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> PortalProfileRead:
    """Update portal-owned profile fields only. Never touches login's data."""
    return await profile_service.update_portal_profile(db, user.id, payload)


@public_router.get("/{slug}", response_model=PublicProfileRead)
async def get_public_profile(slug: str, db: AsyncSession = Depends(get_db)) -> PublicProfileRead:
    """Return a user's public profile page data. 404 if not public or not found."""
    try:
        profile = await profile_service.get_public_profile(db, slug)
    except login_service.LoginUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")
    if profile is None:
        raise HTTPException(status_code=404, detail="Not found")
    return profile

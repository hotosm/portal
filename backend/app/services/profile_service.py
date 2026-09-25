"""Portal-owned profile CRUD, merged with account fields fetched live from login."""

from dataclasses import asdict

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.profile import PortalProfile
from app.models.profile import (
    PortalProfileRead,
    ProfileMeRead,
    ProfilePatch,
    PublicProfileRead,
)
from app.services import login_service


async def get_or_create_portal_profile(db: AsyncSession, hanko_user_id: str) -> PortalProfile:
    """Return the portal_profiles row for this user, creating an empty one if absent."""
    stmt = (
        insert(PortalProfile)
        .values(hanko_user_id=hanko_user_id)
        .on_conflict_do_nothing(index_elements=["hanko_user_id"])
    )
    await db.execute(stmt)
    result = await db.execute(
        select(PortalProfile).where(PortalProfile.hanko_user_id == hanko_user_id)
    )
    return result.scalar_one()


async def get_merged_profile(db: AsyncSession, hanko_user_id: str) -> ProfileMeRead | None:
    """Build the GET /api/profile/me response.

    Returns None if login has no account profile for this user yet. Raises
    login_service.LoginUnavailable on upstream failure (route translates to 502).
    """
    account = await login_service.get_account_profile(hanko_user_id)
    if account is None:
        return None

    portal = await get_or_create_portal_profile(db, hanko_user_id)

    return ProfileMeRead(
        hanko_user_id=account.hanko_user_id,
        first_name=account.first_name,
        last_name=account.last_name,
        picture_url=account.picture_url,
        slug=account.slug,
        is_public=account.is_public,
        osm_username=account.osm_username,
        osm_avatar_url=account.osm_avatar_url,
        portal=PortalProfileRead.model_validate(portal),
    )


async def update_portal_profile(
    db: AsyncSession, hanko_user_id: str, payload: ProfilePatch
) -> PortalProfileRead:
    """Apply a partial update to portal_profiles only. Never calls login."""
    update_data = payload.model_dump(exclude_unset=True)

    profile = await get_or_create_portal_profile(db, hanko_user_id)
    for field, value in update_data.items():
        setattr(profile, field, value)
    await db.flush()
    await db.refresh(profile)

    return PortalProfileRead.model_validate(profile)


async def get_public_profile(db: AsyncSession, slug: str) -> PublicProfileRead | None:
    """Build the GET /api/public/profile/{slug} response.

    Returns None if login reports the profile isn't public or doesn't exist
    (route 404s). Raises login_service.LoginUnavailable on upstream failure
    (route translates to 502) — never falls back to serving portal_profiles
    data without login confirming public visibility first.
    """
    account = await login_service.get_public_account_profile(slug)
    if account is None:
        return None

    result = await db.execute(
        select(PortalProfile).where(PortalProfile.hanko_user_id == account.hanko_user_id)
    )
    portal = result.scalar_one_or_none()

    organizations = None
    if portal is not None and portal.show_organizations:
        groups = await login_service.get_public_user_groups_by_slug(slug, "org")
        organizations = [asdict(g) for g in groups]

    return PublicProfileRead(
        slug=account.slug,
        first_name=account.first_name,
        last_name=account.last_name,
        picture_url=account.picture_url,
        bio=portal.bio if portal else None,
        location=portal.location if portal else None,
        contact_email=portal.contact_email if portal else None,
        phone=portal.phone if portal else None,
        linkedin_url=portal.linkedin_url if portal else None,
        organizations=organizations,
    )

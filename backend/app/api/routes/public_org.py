"""Public organization profile — proxied live from login.

Portal keeps no organization data of its own; login decides what's public
(public and approved orgs only) and portal passes it through.
"""

from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.plan import PlanSummary
from app.models.profile import PublicOrganizationRead
from app.services import login_service, plans_service

router = APIRouter(prefix="/public/org", tags=["profile"])


@router.get("/{slug}", response_model=PublicOrganizationRead)
async def get_public_organization(
    slug: str, response: Response, locale: str | None = Query(None)
) -> PublicOrganizationRead:
    """Return an organization's public profile. 404 if not public or not found.

    Translatable content comes in ``locale`` where the org has it, otherwise
    in its base locale.
    """
    try:
        org = await login_service.get_public_organization(slug, locale)
    except login_service.LoginUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")
    if org is None:
        raise HTTPException(status_code=404, detail="Not found")
    response.headers["Cache-Control"] = "no-store"
    return PublicOrganizationRead(**asdict(org))


@router.get("/{slug}/plans", response_model=list[PlanSummary])
async def get_public_organization_plans(
    slug: str, response: Response, db: AsyncSession = Depends(get_db)
) -> list[PlanSummary]:
    """Return an organization's public plans. 404 if the org isn't public or not found.

    Plans aren't translated, so there's no locale here.
    """
    try:
        org = await login_service.get_public_organization(slug)
    except login_service.LoginUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")
    if org is None:
        raise HTTPException(status_code=404, detail="Not found")
    response.headers["Cache-Control"] = "no-store"
    if not org.id:
        return []
    return await plans_service.list_public_group_plans(db, "organization", org.id)

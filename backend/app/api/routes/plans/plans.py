"""Plans API endpoints — user-owned collections of project references."""

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.plan import (
    PlanCreate,
    PlanRead,
    PlanReadHydrated,
    PlanUpdate,
)
from app.services import plans_service
from app.services.plans_service import DuplicateProjectError

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanRead])
async def list_my_plans(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> list[PlanRead]:
    """List all plans owned by the authenticated user (lightweight, no hydration)."""
    return await plans_service.list_plans(db, user.id)


@router.post("", response_model=PlanRead, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: PlanCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> PlanRead:
    """Create a new plan owned by the authenticated user."""
    try:
        return await plans_service.create_plan(db, user.id, payload)
    except DuplicateProjectError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/shared/{plan_id}", response_model=PlanReadHydrated)
async def get_shared_plan(
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanReadHydrated:
    """Return a public plan hydrated. No auth required. 404 if plan is private or not found."""
    plan = await plans_service.get_public_plan_hydrated(db, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.get("/{plan_id}", response_model=PlanReadHydrated)
async def get_plan(
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanReadHydrated:
    """Return the plan with each project hydrated in parallel from its upstream app."""
    plan = await plans_service.get_plan_hydrated(db, user.id, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.patch("/{plan_id}", response_model=PlanRead)
async def update_plan(
    payload: PlanUpdate,
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanRead:
    """Update name/description/is_public and/or replace the full projects list."""
    try:
        plan = await plans_service.update_plan(db, user.id, plan_id, payload)
    except DuplicateProjectError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a plan; plan_projects rows cascade automatically."""
    ok = await plans_service.delete_plan(db, user.id, plan_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

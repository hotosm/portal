"""Plans API endpoints — user-owned collections of project references."""

from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response, status
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.plan import (
    CompleteTaskRequest,
    PlanCreate,
    PlanRead,
    PlanReadHydrated,
    PlanUpdate,
    ProjectStatusUpdate,
    UrlResolveRequest,
    UrlResolveResponse,
)
from app.services import plans_service
from app.services.exceptions import UpstreamUnavailable
from app.services.plans_service import DuplicateProjectError, InvalidUrlError, ProjectNotFoundError

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


@router.post("/resolve-url", response_model=UrlResolveResponse)
async def resolve_project_url(
    payload: UrlResolveRequest,
    request: Request,
    user: CurrentUser,
) -> UrlResolveResponse:
    """Parse a project URL and confirm the project exists upstream.

    Returns app, project_id, and raw upstream data on success.
    422 if the URL format is not recognized, 404 if project not found,
    502 if the upstream service is unreachable.
    """
    hanko_cookie = request.cookies.get("hanko")
    try:
        return await plans_service.resolve_project_url(payload.url, hanko_cookie=hanko_cookie)
    except InvalidUrlError:
        raise HTTPException(status_code=422, detail="URL does not match any supported app")
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="project_not_found")
    except UpstreamUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")


@router.get("/shared/{plan_id}", response_model=PlanReadHydrated)
async def get_shared_plan(
    request: Request,
    plan_id: str = Path(..., description="Plan UUID"),
    refresh: bool = False,
    db: AsyncSession = Depends(get_db),
) -> PlanReadHydrated:
    """Return a public plan. No auth required. 404 if plan is private or not found.

    Default serves the stored snapshot instantly; pass ?refresh=true to hydrate
    every project live and persist the fresh snapshot (stale-while-revalidate)."""
    hanko_cookie = request.cookies.get("hanko")
    plan = await plans_service.get_public_plan_hydrated(
        db, plan_id, hanko_cookie=hanko_cookie, refresh=refresh
    )
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.get("/{plan_id}", response_model=PlanReadHydrated)
async def get_plan(
    request: Request,
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    refresh: bool = False,
    db: AsyncSession = Depends(get_db),
) -> PlanReadHydrated:
    """Return the plan. By default serves the stored snapshot instantly (no upstream
    calls). Pass ?refresh=true to hydrate every project live and persist the fresh
    snapshot — the frontend calls this in the background (stale-while-revalidate).
    """
    hanko_cookie = request.cookies.get("hanko")
    plan = await plans_service.get_plan_hydrated(
        db, user.id, plan_id, hanko_cookie=hanko_cookie, refresh=refresh
    )
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


@router.patch("/{plan_id}/projects/{plan_project_id}/toggle-exists", status_code=status.HTTP_204_NO_CONTENT)
async def toggle_project_exists(
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    plan_project_id: str = Path(..., description="plan_project UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Toggle project_exists on a plan_project between true and false."""
    ok = await plans_service.toggle_project_exists(db, user.id, plan_id, plan_project_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{plan_id}/projects/{plan_project_id}/complete-task", status_code=status.HTTP_204_NO_CONTENT)
async def complete_task(
    payload: CompleteTaskRequest,
    request: Request,
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    plan_project_id: str = Path(..., description="plan_project UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Set project_exists=True and store upstream data on the row.

    Accepts either url or app+project_id. Only applies to rows where project_exists=False.
    422 if URL format is unrecognized, 404 if project not found upstream,
    502 if upstream is unreachable.
    """
    hanko_cookie = request.cookies.get("hanko")
    try:
        ok = await plans_service.complete_task(
            db,
            user.id,
            plan_id,
            plan_project_id,
            url=payload.url,
            app=payload.app,
            input_project_id=payload.project_id,
            hanko_cookie=hanko_cookie,
        )
    except InvalidUrlError:
        raise HTTPException(status_code=422, detail="URL does not match any supported app")
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="project_not_found")
    except UpstreamUnavailable:
        raise HTTPException(status_code=502, detail="upstream_unavailable")
    except DuplicateProjectError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{plan_id}/projects/{app}/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_project_status(
    payload: ProjectStatusUpdate,
    user: CurrentUser,
    plan_id: str = Path(..., description="Plan UUID"),
    app: str = Path(..., description="App name"),
    project_id: str = Path(..., description="External project ID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Update the status of a single project inside a plan."""
    ok = await plans_service.set_project_status(db, user.id, plan_id, app, project_id, payload.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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

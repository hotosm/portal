"""Plans API endpoints — user-owned collections of project references."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response, status
from hotosm_auth_fastapi import CurrentUser
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.plan import (
    CompleteTaskRequest,
    PlanCollectionCreate,
    PlanCollectionRead,
    PlanCollectionUpdate,
    PlanCreate,
    PlanProjectItem,
    PlanRead,
    PlanReadHydrated,
    PlanUpdate,
    ProjectCollectionUpdate,
    ProjectFeaturedUpdate,
    ProjectReorder,
    ProjectStatusUpdate,
    UrlResolveRequest,
    UrlResolveResponse,
)
from app.services import permissions, plans_service
from app.services.exceptions import UpstreamUnavailable
from app.services.permissions import PermissionContext
from app.services.plans_service import (
    CollectionNotFoundError,
    DuplicateCollectionError,
    DuplicateProjectError,
    GroupMembershipError,
    InvalidUrlError,
    ProjectNotFoundError,
)

router = APIRouter(prefix="/plans", tags=["plans"])


async def permission_ctx(request: Request, user: CurrentUser) -> PermissionContext:
    """Resolve the user's group memberships once per request (auth required)."""
    return await permissions.build_context(user, request.cookies.get("hanko"))


PermCtx = Annotated[PermissionContext, Depends(permission_ctx)]


@router.get("", response_model=list[PlanRead])
async def list_my_plans(
    ctx: PermCtx,
    db: AsyncSession = Depends(get_db),
) -> list[PlanRead]:
    """List plans visible to the user: their own plus group plans they can see."""
    return await plans_service.list_plans(db, ctx)


@router.post("", response_model=PlanRead, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: PlanCreate,
    ctx: PermCtx,
    db: AsyncSession = Depends(get_db),
) -> PlanRead:
    """Create a new plan owned by the authenticated user."""
    try:
        return await plans_service.create_plan(db, ctx, payload)
    except GroupMembershipError as e:
        raise HTTPException(status_code=403, detail=str(e))
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
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    refresh: bool = False,
    db: AsyncSession = Depends(get_db),
) -> PlanReadHydrated:
    """Return the plan if the user may view it. By default serves the stored
    snapshot instantly; pass ?refresh=true to hydrate live (stale-while-revalidate).
    """
    hanko_cookie = request.cookies.get("hanko")
    plan = await plans_service.get_plan_hydrated(
        db, ctx, plan_id, hanko_cookie=hanko_cookie, refresh=refresh
    )
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.patch("/{plan_id}", response_model=PlanRead)
async def update_plan(
    payload: PlanUpdate,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanRead:
    """Update name/description/scope/visibility and/or replace the projects list."""
    try:
        plan = await plans_service.update_plan(db, ctx, plan_id, payload)
    except GroupMembershipError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except DuplicateProjectError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.patch(
    "/{plan_id}/projects/{plan_project_id}/toggle-exists", status_code=status.HTTP_204_NO_CONTENT
)
async def toggle_project_exists(
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    plan_project_id: str = Path(..., description="plan_project UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Toggle project_exists on a plan_project between true and false."""
    ok = await plans_service.toggle_project_exists(db, ctx, plan_id, plan_project_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{plan_id}/projects/{plan_project_id}/complete-task", status_code=status.HTTP_204_NO_CONTENT
)
async def complete_task(
    payload: CompleteTaskRequest,
    request: Request,
    ctx: PermCtx,
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
            ctx,
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


@router.get("/{plan_id}/collections", response_model=list[PlanCollectionRead])
async def list_collections(
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> list[PlanCollectionRead]:
    """List the collections of a plan the user may view."""
    collections = await plans_service.list_collections(db, ctx, plan_id)
    if collections is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return collections


@router.post(
    "/{plan_id}/collections",
    response_model=PlanCollectionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_collection(
    payload: PlanCollectionCreate,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanCollectionRead:
    """Add a collection to a plan. Every editor of the plan sees it."""
    try:
        collection = await plans_service.create_collection(db, ctx, plan_id, payload)
    except DuplicateCollectionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if collection is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return collection


@router.patch("/{plan_id}/collections/{collection_id}", response_model=PlanCollectionRead)
async def update_collection(
    payload: PlanCollectionUpdate,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    collection_id: str = Path(..., description="Collection UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanCollectionRead:
    """Rename a collection, edit its description, or move it in the plan."""
    try:
        collection = await plans_service.update_collection(db, ctx, plan_id, collection_id, payload)
    except DuplicateCollectionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if collection is None:
        raise HTTPException(status_code=404, detail="Plan or collection not found")
    return collection


@router.delete("/{plan_id}/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    collection_id: str = Path(..., description="Collection UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a collection; its projects fall back to the "All" bucket."""
    ok = await plans_service.delete_collection(db, ctx, plan_id, collection_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or collection not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{plan_id}/projects", response_model=PlanProjectItem, status_code=status.HTTP_201_CREATED
)
async def add_project(
    payload: PlanProjectItem,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> PlanProjectItem:
    """Append one project/task, leaving the rest of the plan untouched."""
    try:
        item = await plans_service.add_project(db, ctx, plan_id, payload)
    except CollectionNotFoundError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except DuplicateProjectError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if item is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return item


@router.patch("/{plan_id}/projects/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_projects(
    payload: ProjectReorder,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Apply the placements a drag produced: collection + position per project."""
    try:
        ok = await plans_service.reorder_projects(db, ctx, plan_id, payload.items)
    except CollectionNotFoundError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{plan_id}/projects/{plan_project_id}/collection",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def set_project_collection(
    payload: ProjectCollectionUpdate,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    plan_project_id: str = Path(..., description="plan_project UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Move one project to a collection of this plan. Null means "All"."""
    try:
        ok = await plans_service.set_project_collection(
            db, ctx, plan_id, plan_project_id, payload.collection_id
        )
    except CollectionNotFoundError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{plan_id}/projects/{plan_project_id}/featured", status_code=status.HTTP_204_NO_CONTENT
)
async def set_project_featured(
    payload: ProjectFeaturedUpdate,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    plan_project_id: str = Path(..., description="plan_project UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Mark/unmark one project as featured without touching the rest of the plan."""
    ok = await plans_service.set_project_featured(
        db, ctx, plan_id, plan_project_id, payload.featured
    )
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{plan_id}/projects/{plan_project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project(
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    plan_project_id: str = Path(..., description="plan_project UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete one project/task from a plan, leaving the rest untouched."""
    ok = await plans_service.remove_project(db, ctx, plan_id, plan_project_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{plan_id}/projects/{app}/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_project_status(
    payload: ProjectStatusUpdate,
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    app: str = Path(..., description="App name"),
    project_id: str = Path(..., description="External project ID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Update the status of a single project inside a plan."""
    ok = await plans_service.set_project_status(db, ctx, plan_id, app, project_id, payload.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan or project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    ctx: PermCtx,
    plan_id: str = Path(..., description="Plan UUID"),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a plan (owner only); plan_projects rows cascade automatically."""
    ok = await plans_service.delete_plan(db, ctx, plan_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Plan not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

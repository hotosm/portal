"""Service layer for user-owned plans: CRUD, hydration, and tag lookups."""

import asyncio
import copy
from collections import defaultdict
from typing import get_args

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.plan import Plan, PlanCollection, PlanProject
from app.models.plan import (
    AppLiteral,
    HydratedProjectItem,
    PlanCollectionCreate,
    PlanCollectionRead,
    PlanCollectionUpdate,
    PlanCreate,
    PlanImageRead,
    PlanProjectItem,
    PlanRead,
    PlanReadHydrated,
    PlanTag,
    PlanUpdate,
    ProjectPlacement,
    StatusLiteral,
    UrlResolveResponse,
)
from app.services import (
    chatmap_service,
    drone_tm_service,
    export_tool_service,
    fair_service,
    field_tm_service,
    open_aerial_map_service,
    permissions,
    tasking_manager_service,
    umap_service,
    url_resolver,
)
from app.services.exceptions import UpstreamUnavailable
from app.services.permissions import PermissionContext

_KNOWN_APPS = frozenset(get_args(AppLiteral))

# Per-fetcher timeout for plan hydration. Lower than the httpx default so a
# single slow/down upstream cannot block the whole gather and trip Traefik's
# 30s gateway timeout.
HYDRATE_FETCHER_TIMEOUT = 8.0


class DuplicateProjectError(ValueError):
    """Raised when a plan payload contains duplicate (app, project_id) entries."""


class InvalidUrlError(ValueError):
    """Raised when a URL does not match any supported app pattern."""


class ProjectNotFoundError(ValueError):
    """Raised when a URL resolves to an app/project_id that does not exist upstream."""


APP_FETCHERS = {
    "tasking-manager": tasking_manager_service.fetch_project_by_id,
    "field-tm": field_tm_service.fetch_project_by_id,
    "drone-tasking-manager": drone_tm_service.fetch_project_by_id,
    "fair": fair_service.fetch_model_by_id,
    "open-aerial-map": open_aerial_map_service.fetch_imagery_by_id,
    "export-tool": export_tool_service.fetch_job_by_uid,
    "chatmap": chatmap_service.fetch_map_by_id,
}


def plan_to_read(plan: Plan, ctx: PermissionContext) -> PlanRead:
    return PlanRead(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        is_public=plan.is_public,
        visibility=plan.visibility,
        group_type=plan.group_type,
        group_id=plan.group_id,
        edit_scope=plan.edit_scope,
        owner_id=plan.owner_id,
        is_owner=ctx.user_id is not None and ctx.user_id == plan.owner_id,
        can_edit=permissions.can_edit(plan, ctx),
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        projects=[
            PlanProjectItem(
                id=row.id,
                app=row.app,
                project_id=row.project_id,
                project_exists=row.project_exists,
                status=row.status,
                featured=row.featured,
                data=row.data,
                collection_id=row.collection_id,
            )
            for row in plan.projects
            if not row.project_exists or row.app in _KNOWN_APPS
        ],
        collections=[PlanCollectionRead.model_validate(c) for c in plan.collections],
        images=[
            PlanImageRead(
                id=img.id,
                url=img.url,
                display_order=img.display_order,
                created_at=img.created_at,
            )
            for img in plan.images
        ],
    )


def check_no_duplicates(items: list[PlanProjectItem]) -> None:
    seen: set[tuple[str, str]] = set()
    for item in items:
        if not item.project_exists:
            continue
        key = (item.app, item.project_id)
        if key in seen:
            raise DuplicateProjectError(
                f"Duplicate project in payload: app={item.app} project_id={item.project_id}"
            )
        seen.add(key)


async def list_plans(db: AsyncSession, ctx: PermissionContext) -> list[PlanRead]:
    """List plans visible to the user: their own, plus group plans of groups
    they belong to. Membership is resolved once (in ctx) so this stays a single
    SELECT with no N+1."""
    conditions = [Plan.owner_id == ctx.user_id]
    group_conditions = [
        and_(Plan.group_type == gtype, Plan.group_id == gid) for (gtype, gid) in ctx.memberships
    ]
    if group_conditions:
        conditions.append(
            and_(
                or_(*group_conditions),
                Plan.visibility.in_(["group", "public"]),
            )
        )

    stmt = (
        select(Plan)
        .where(or_(*conditions))
        .options(
            selectinload(Plan.projects),
            selectinload(Plan.collections),
            selectinload(Plan.images),
        )
        .order_by(Plan.created_at.desc())
    )
    result = await db.execute(stmt)
    plans = result.scalars().all()
    return [plan_to_read(p, ctx) for p in plans]


async def _load_plan(db: AsyncSession, plan_id: str) -> Plan | None:
    stmt = (
        select(Plan)
        .where(Plan.id == plan_id)
        .options(
            selectinload(Plan.projects),
            selectinload(Plan.collections),
            selectinload(Plan.images),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_viewable_plan(db: AsyncSession, ctx: PermissionContext, plan_id: str) -> Plan | None:
    """Load a plan only if the context may view it (else None → 404)."""
    plan = await _load_plan(db, plan_id)
    if plan is None or not permissions.can_view(plan, ctx):
        return None
    return plan


async def get_editable_plan(db: AsyncSession, ctx: PermissionContext, plan_id: str) -> Plan | None:
    """Load a plan only if the context may edit it (else None → 404)."""
    plan = await _load_plan(db, plan_id)
    if plan is None or not permissions.can_edit(plan, ctx):
        return None
    return plan


async def get_owned_plan(db: AsyncSession, owner_id: str, plan_id: str) -> Plan | None:
    """Load a plan owned by owner_id (used where only the creator may act)."""
    stmt = (
        select(Plan)
        .where(Plan.id == plan_id, Plan.owner_id == owner_id)
        .options(
            selectinload(Plan.projects),
            selectinload(Plan.collections),
            selectinload(Plan.images),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


def _resolve_scope(payload: PlanCreate | PlanUpdate) -> dict:
    """Map create/update scope fields to Plan columns, honoring is_public BC."""
    values: dict = {}
    if payload.visibility is not None:
        values["visibility"] = payload.visibility
    elif payload.is_public is not None:
        values["visibility"] = "public" if payload.is_public else "private"
    if payload.group_type is not None:
        values["group_type"] = payload.group_type or None
    if payload.group_id is not None:
        values["group_id"] = payload.group_id or None
    if payload.edit_scope is not None:
        values["edit_scope"] = payload.edit_scope
    return values


class GroupMembershipError(ValueError):
    """Raised when assigning a plan to a group the user does not belong to."""


async def create_plan(db: AsyncSession, ctx: PermissionContext, payload: PlanCreate) -> PlanRead:
    check_no_duplicates(payload.projects)

    scope = _resolve_scope(payload)
    group_type = scope.get("group_type")
    group_id = scope.get("group_id")
    if group_id and not permissions.is_member(ctx, group_type, group_id):
        raise GroupMembershipError("Not a member of the target group")

    plan = Plan(
        owner_id=ctx.user_id,
        name=payload.name,
        description=payload.description,
        visibility=scope.get("visibility", "private"),
        group_type=group_type,
        group_id=group_id,
        edit_scope=scope.get("edit_scope", "owner"),
    )
    db.add(plan)
    await db.flush()

    for idx, item in enumerate(payload.projects):
        db.add(
            PlanProject(
                plan_id=plan.id,
                app=item.app,
                project_id=item.project_id,
                project_exists=item.project_exists,
                status=item.status,
                featured=item.featured,
                display_order=idx,
                data=item.data,
            )
        )

    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateProjectError(str(e)) from e

    await db.refresh(plan, attribute_names=["projects", "collections", "images"])
    return plan_to_read(plan, ctx)


async def _merge_projects(db: AsyncSession, plan: Plan, items: list[PlanProjectItem]) -> None:
    """Reconcile the plan's rows with the payload, keeping row identity.

    Each payload item is matched to an existing row by id, falling back to
    (app, project_id) for callers that don't send ids. Matched rows are updated
    in place, so everything keyed to plan_project.id — the collection above all
    — survives the save. Rows missing from the payload are deleted.

    Replacing the whole list used to mean DELETE + INSERT, which handed every
    row a new id and silently dropped its collection on any plan edit
    (reorder, featured, add, delete).
    """
    rows_by_id = {row.id: row for row in plan.projects}
    rows_by_key = {
        (row.app, row.project_id): row
        for row in plan.projects
        if row.project_exists and row.app and row.project_id
    }
    # display_order counts within a collection, so each bucket has its own cursor.
    next_order: dict[str | None, int] = defaultdict(int)
    kept: set[str] = set()

    for item in items:
        row = rows_by_id.get(item.id) if item.id else None
        if row is None and item.project_exists and item.app and item.project_id:
            row = rows_by_key.get((item.app, item.project_id))

        # An absent collection_id means "leave it where it is": the payload
        # carries the plan's projects, not their placement, and only the
        # reorder/collection endpoints move things around.
        collection_id = (
            item.collection_id
            if "collection_id" in item.model_fields_set
            else (row.collection_id if row is not None else None)
        )

        if row is None:
            row = PlanProject(plan_id=plan.id)
            db.add(row)
            plan.projects.append(row)
        else:
            kept.add(row.id)

        row.app = item.app
        row.project_id = item.project_id
        row.project_exists = item.project_exists
        row.status = item.status
        row.featured = item.featured
        row.data = item.data
        row.collection_id = collection_id
        row.display_order = next_order[collection_id]
        next_order[collection_id] += 1

    # Rows created above have no id until the flush, so they never look removed.
    # delete-orphan on Plan.projects turns the detach into a DELETE.
    for row in [row for row in plan.projects if row.id and row.id not in kept]:
        plan.projects.remove(row)
    await db.flush()


async def update_plan(
    db: AsyncSession, ctx: PermissionContext, plan_id: str, payload: PlanUpdate
) -> PlanRead | None:
    plan = await get_editable_plan(db, ctx, plan_id)
    if plan is None:
        return None

    if payload.name is not None:
        plan.name = payload.name
    if payload.description is not None:
        plan.description = payload.description

    scope = _resolve_scope(payload)
    group_id = scope.get("group_id", plan.group_id)
    group_type = scope.get("group_type", plan.group_type)
    if "group_id" in scope and group_id and not permissions.is_member(ctx, group_type, group_id):
        raise GroupMembershipError("Not a member of the target group")
    for field, value in scope.items():
        setattr(plan, field, value)

    if payload.projects is not None:
        check_no_duplicates(payload.projects)
        await _merge_projects(db, plan, payload.projects)

    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateProjectError(str(e)) from e

    await db.refresh(plan, attribute_names=["projects", "collections", "images"])
    return plan_to_read(plan, ctx)


async def toggle_project_exists(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    plan_project_id: str,
) -> bool:
    """Toggle project_exists on a plan_project row. Returns False if not found."""
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    stmt = select(PlanProject).where(
        PlanProject.plan_id == plan_id,
        PlanProject.id == plan_project_id,
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()
    if row is None:
        return False
    row.project_exists = not row.project_exists
    await db.flush()
    return True


async def complete_task(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    plan_project_id: str,
    url: str | None = None,
    app: str | None = None,
    input_project_id: str | None = None,
    hanko_cookie: str | None = None,
) -> bool:
    """Set project_exists=True and store upstream data+app on the row.

    Accepts either a url (resolved via parse+fetch) or a direct app+project_id pair.
    Only targets rows where project_exists=False. Returns False if not found.
    Raises InvalidUrlError, ProjectNotFoundError, or UpstreamUnavailable.
    """
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    stmt = select(PlanProject).where(
        PlanProject.plan_id == plan_id,
        PlanProject.id == plan_project_id,
        PlanProject.project_exists.is_(False),
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()
    if row is None:
        return False

    if url is not None:
        resolved = await resolve_project_url(url, hanko_cookie=hanko_cookie)
    else:
        resolved = await _fetch_by_app_project(app, input_project_id, hanko_cookie=hanko_cookie)
    row.project_exists = True
    row.app = resolved.app
    row.project_id = resolved.project_id
    row.data = resolved.upstream
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateProjectError(str(e)) from e
    return True


async def delete_plan(db: AsyncSession, ctx: PermissionContext, plan_id: str) -> bool:
    """Delete a plan. Only the owner may delete (not group members)."""
    plan = await get_owned_plan(db, ctx.user_id, plan_id)
    if plan is None:
        return False
    await db.delete(plan)
    await db.flush()
    return True


async def set_project_status(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    app: str,
    ext_project_id: str,
    new_status: StatusLiteral,
) -> bool:
    """Update the status of a single project inside a plan. Returns False if not found."""
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    stmt = select(PlanProject).where(
        PlanProject.plan_id == plan_id,
        PlanProject.app == app,
        PlanProject.project_id == ext_project_id,
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()
    if row is None:
        return False
    row.status = new_status
    await db.flush()
    return True


class CollectionNotFoundError(ValueError):
    """Raised when a collection_id doesn't belong to the plan being edited."""


class DuplicateCollectionError(ValueError):
    """Raised when a plan already has a collection with that name."""


async def _get_plan_project(
    db: AsyncSession, plan_id: str, plan_project_id: str
) -> PlanProject | None:
    stmt = select(PlanProject).where(
        PlanProject.plan_id == plan_id,
        PlanProject.id == plan_project_id,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _assert_collection_in_plan(
    db: AsyncSession, plan_id: str, collection_id: str | None
) -> None:
    """Guard against pointing a project at a collection of a different plan."""
    if collection_id is None:
        return
    stmt = select(PlanCollection.id).where(
        PlanCollection.id == collection_id,
        PlanCollection.plan_id == plan_id,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none() is None:
        raise CollectionNotFoundError("Collection not found in this plan")


async def list_collections(
    db: AsyncSession, ctx: PermissionContext, plan_id: str
) -> list[PlanCollectionRead] | None:
    """Collections of a plan the user may view, ordered as they render."""
    plan = await get_viewable_plan(db, ctx, plan_id)
    if plan is None:
        return None
    return [PlanCollectionRead.model_validate(c) for c in plan.collections]


async def create_collection(
    db: AsyncSession, ctx: PermissionContext, plan_id: str, payload: PlanCollectionCreate
) -> PlanCollectionRead | None:
    """Append a collection to a plan the user may edit."""
    plan = await get_editable_plan(db, ctx, plan_id)
    if plan is None:
        return None
    collection = PlanCollection(
        plan_id=plan.id,
        name=payload.name,
        description=payload.description,
        display_order=len(plan.collections),
    )
    db.add(collection)
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateCollectionError(f"'{payload.name}' already exists in this plan") from e
    await db.refresh(collection)
    return PlanCollectionRead.model_validate(collection)


async def update_collection(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    collection_id: str,
    payload: PlanCollectionUpdate,
) -> PlanCollectionRead | None:
    """Rename a collection, edit its description, or move it in the plan."""
    if await get_editable_plan(db, ctx, plan_id) is None:
        return None
    stmt = select(PlanCollection).where(
        PlanCollection.id == collection_id, PlanCollection.plan_id == plan_id
    )
    result = await db.execute(stmt)
    collection = result.scalar_one_or_none()
    if collection is None:
        return None
    if payload.name is not None:
        collection.name = payload.name
    if payload.description is not None:
        collection.description = payload.description
    if payload.display_order is not None:
        collection.display_order = payload.display_order
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateCollectionError(f"'{payload.name}' already exists in this plan") from e
    await db.refresh(collection)
    return PlanCollectionRead.model_validate(collection)


async def delete_collection(
    db: AsyncSession, ctx: PermissionContext, plan_id: str, collection_id: str
) -> bool:
    """Delete a collection; its projects fall back to the virtual "All" bucket."""
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    stmt = select(PlanCollection).where(
        PlanCollection.id == collection_id, PlanCollection.plan_id == plan_id
    )
    result = await db.execute(stmt)
    collection = result.scalar_one_or_none()
    if collection is None:
        return False
    # ON DELETE SET NULL only fires in the database, so clear the loaded rows
    # too — the session would otherwise keep serving the stale collection_id.
    await db.execute(
        update(PlanProject)
        .where(PlanProject.collection_id == collection_id)
        .values(collection_id=None)
    )
    await db.delete(collection)
    await db.flush()
    return True


async def set_project_collection(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    plan_project_id: str,
    collection_id: str | None,
) -> bool:
    """Move one project to a collection of the same plan (None means "All").

    Returns False if the plan or project is not found/not editable. Raises
    CollectionNotFoundError if the collection belongs to another plan.
    """
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    row = await _get_plan_project(db, plan_id, plan_project_id)
    if row is None:
        return False
    if row.collection_id == collection_id:
        return True
    await _assert_collection_in_plan(db, plan_id, collection_id)
    row.collection_id = collection_id
    # Land at the end of the target bucket; a drag sends explicit positions
    # through reorder_projects instead.
    row.display_order = await _next_display_order(db, plan_id, collection_id)
    await db.flush()
    return True


async def _next_display_order(db: AsyncSession, plan_id: str, collection_id: str | None) -> int:
    stmt = select(func.max(PlanProject.display_order)).where(
        PlanProject.plan_id == plan_id,
        PlanProject.collection_id.is_(None)
        if collection_id is None
        else PlanProject.collection_id == collection_id,
    )
    result = await db.execute(stmt)
    return (result.scalar() or 0) + 1


async def reorder_projects(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    placements: list[ProjectPlacement],
) -> bool:
    """Apply the placements a drag produced: collection + position per project.

    Every id must belong to the plan and every collection to the same plan;
    anything else is rejected so a stale frontend can't scatter rows across plans.
    """
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    if not placements:
        return True

    stmt = select(PlanProject).where(
        PlanProject.plan_id == plan_id,
        PlanProject.id.in_([p.id for p in placements]),
    )
    result = await db.execute(stmt)
    rows = {row.id: row for row in result.scalars().all()}
    if len(rows) != len({p.id for p in placements}):
        return False

    for collection_id in {p.collection_id for p in placements}:
        await _assert_collection_in_plan(db, plan_id, collection_id)

    for placement in placements:
        row = rows[placement.id]
        row.collection_id = placement.collection_id
        row.display_order = placement.display_order
    await db.flush()
    return True


async def set_project_featured(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    plan_project_id: str,
    featured: bool,
) -> bool:
    """Toggle the featured flag on one project. Returns False if not found."""
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    row = await _get_plan_project(db, plan_id, plan_project_id)
    if row is None:
        return False
    row.featured = featured
    await db.flush()
    return True


async def add_project(
    db: AsyncSession, ctx: PermissionContext, plan_id: str, item: PlanProjectItem
) -> PlanProjectItem | None:
    """Append one project/task to a plan, optionally straight into a collection.

    Adding one row at a time (instead of PATCHing the whole plan) keeps the
    other rows — and their collections — untouched.
    """
    plan = await get_editable_plan(db, ctx, plan_id)
    if plan is None:
        return None
    await _assert_collection_in_plan(db, plan_id, item.collection_id)
    if item.project_exists and any(
        row.project_exists and row.app == item.app and row.project_id == item.project_id
        for row in plan.projects
    ):
        raise DuplicateProjectError(
            f"Duplicate project in plan: app={item.app} project_id={item.project_id}"
        )
    row = PlanProject(
        plan_id=plan.id,
        collection_id=item.collection_id,
        app=item.app,
        project_id=item.project_id,
        project_exists=item.project_exists,
        status=item.status,
        featured=item.featured,
        data=item.data,
        display_order=await _next_display_order(db, plan_id, item.collection_id),
    )
    db.add(row)
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateProjectError(str(e)) from e
    await db.refresh(row)
    return PlanProjectItem(
        id=row.id,
        app=row.app,
        project_id=row.project_id,
        project_exists=row.project_exists,
        status=row.status,
        featured=row.featured,
        data=row.data,
        collection_id=row.collection_id,
    )


async def remove_project(
    db: AsyncSession, ctx: PermissionContext, plan_id: str, plan_project_id: str
) -> bool:
    """Delete one project/task from a plan. Returns False if not found."""
    if await get_editable_plan(db, ctx, plan_id) is None:
        return False
    row = await _get_plan_project(db, plan_id, plan_project_id)
    if row is None:
        return False
    await db.delete(row)
    await db.flush()
    return True


async def hydrate_one(
    row: PlanProject,
    hanko_cookie: str | None = None,
    *,
    force_refresh: bool = False,
) -> HydratedProjectItem:
    if not row.project_exists:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            project_exists=False,
            featured=row.featured,
            data=row.data,
            upstream=None,
            error=None,
        )

    if row.app == "chatmap":
        try:
            upstream = await asyncio.wait_for(
                chatmap_service.fetch_map_by_id(
                    row.project_id,
                    base_url="https://chatmap.hotosm.org/api/v1",
                    hanko_cookie=hanko_cookie,
                    force_refresh=force_refresh,
                ),
                timeout=HYDRATE_FETCHER_TIMEOUT,
            )
            if upstream is None and hanko_cookie:
                # Auth may have failed (e.g. local dev Hanko mismatch). Try without auth —
                # ChatMap maps shared by link return metadata even without credentials.
                upstream = await asyncio.wait_for(
                    chatmap_service.fetch_map_by_id(
                        row.project_id,
                        base_url="https://chatmap.hotosm.org/api/v1",
                        hanko_cookie=None,
                        force_refresh=force_refresh,
                    ),
                    timeout=HYDRATE_FETCHER_TIMEOUT,
                )
        except TimeoutError:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="upstream_timeout",
            )
        except Exception:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="upstream_unavailable",
            )
        if upstream is None:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="not_found",
            )
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=upstream,
            error=None,
        )

    if row.app == "umap":
        try:
            upstream = await asyncio.wait_for(
                umap_service.fetch_map_by_id(
                    row.project_id,
                    base_url="https://umap.hotosm.org",
                ),
                timeout=HYDRATE_FETCHER_TIMEOUT,
            )
        except TimeoutError:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="upstream_timeout",
            )
        except Exception:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="upstream_unavailable",
            )
        if upstream is None:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="not_found",
            )
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=upstream,
            error=None,
        )

    if row.app == "field-tm":
        stored_base = (row.data or {}).get("base_url") if isinstance(row.data, dict) else None
        try:
            upstream = await asyncio.wait_for(
                field_tm_service.fetch_project_by_id(
                    row.project_id,
                    base_url=stored_base or None,
                    force_refresh=force_refresh,
                ),
                timeout=HYDRATE_FETCHER_TIMEOUT,
            )
        except TimeoutError:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="upstream_timeout",
            )
        except Exception:
            return HydratedProjectItem(
                app=row.app,
                project_id=row.project_id,
                status=row.status,
                featured=row.featured,
                data=row.data,
                upstream=None,
                error="upstream_unavailable",
            )
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=upstream,
            error=None if upstream else "not_found",
        )

    if row.app == "open-aerial-map" and open_aerial_map_service.is_tms_project_id(row.project_id):
        # TMS-sourced OAM projects resolve via a slow catalog search (see
        # open_aerial_map_service.find_image_by_tms_ids) that manages its own
        # ~20s budget internally — the generic HYDRATE_FETCHER_TIMEOUT (8s) would
        # almost always cut it off before it can finish. A timeout/failure here
        # means "still searching", not "broken", so it maps to error="pending"
        # (spinner) rather than upstream_timeout/upstream_unavailable (which the
        # UI shows as a permanent "Unavailable" state) — the next hydration
        # retries and benefits from whatever pages are already cached.
        try:
            upstream = await open_aerial_map_service.fetch_imagery_by_id(
                row.project_id, force_refresh=force_refresh
            )
        except Exception:
            upstream = None
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=upstream,
            error=None if upstream else "pending",
        )

    fetcher = APP_FETCHERS.get(row.app)
    if fetcher is None:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=None,
            error="not_found",
        )
    try:
        upstream = await asyncio.wait_for(
            fetcher(row.project_id, force_refresh=force_refresh),
            timeout=HYDRATE_FETCHER_TIMEOUT,
        )
    except TimeoutError:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=None,
            error="upstream_timeout",
        )
    except Exception:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=None,
            error="upstream_unavailable",
        )
    if upstream is None:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            status=row.status,
            featured=row.featured,
            data=row.data,
            upstream=None,
            error="not_found",
        )
    return HydratedProjectItem(
        app=row.app,
        project_id=row.project_id,
        status=row.status,
        featured=row.featured,
        data=row.data,
        upstream=upstream,
        error=None,
    )


def _item_from_snapshot(row: PlanProject) -> HydratedProjectItem:
    """Build a hydrated item from the stored snapshot (row.data), no upstream call.

    `error="pending"` flags a project that has never been hydrated successfully
    (row.data is null), so the frontend can show a spinner until the refresh fills it.
    """
    return HydratedProjectItem(
        id=row.id,
        app=row.app,
        project_id=row.project_id,
        project_exists=row.project_exists,
        status=row.status,
        featured=row.featured,
        data=row.data,
        collection_id=row.collection_id,
        upstream=row.data,
        from_snapshot=True,
        error=None if row.data is not None else "pending",
    )


def _build_plan_response(
    plan: Plan, items: list[HydratedProjectItem], ctx: PermissionContext
) -> PlanReadHydrated:
    return PlanReadHydrated(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        is_public=plan.is_public,
        visibility=plan.visibility,
        group_type=plan.group_type,
        group_id=plan.group_id,
        edit_scope=plan.edit_scope,
        owner_id=plan.owner_id,
        is_owner=ctx.user_id is not None and ctx.user_id == plan.owner_id,
        can_edit=permissions.can_edit(plan, ctx),
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        projects=list(items),
        collections=[PlanCollectionRead.model_validate(c) for c in plan.collections],
        images=[
            PlanImageRead(
                id=img.id,
                url=img.url,
                display_order=img.display_order,
                created_at=img.created_at,
            )
            for img in plan.images
        ],
    )


async def _hydrate_live_and_persist(
    db: AsyncSession,
    plan: Plan,
    hanko_cookie: str | None,
) -> list[HydratedProjectItem]:
    """Hydrate every project live, persist the fresh snapshot, and flag deletions.

    A successful upstream fetch overwrites `row.data` (keeps the snapshot fresh).
    A definitive `not_found` (404 from a reachable upstream) marks the project
    `project_exists=False`; transient errors (unavailable/timeout) are left alone
    so a temporary outage never wrongly flags a valid project as deleted.
    """
    hydrated_items = await asyncio.gather(
        *[hydrate_one(row, hanko_cookie=hanko_cookie, force_refresh=True) for row in plan.projects]
    )
    for row, item in zip(plan.projects, hydrated_items, strict=True):
        item.id = row.id
        item.collection_id = row.collection_id
        if item.upstream is not None:
            row.data = item.upstream
            item.data = item.upstream
        elif item.error == "not_found":
            row.project_exists = False
            item.project_exists = False
    await db.flush()
    return list(hydrated_items)


async def get_plan_hydrated(
    db: AsyncSession,
    ctx: PermissionContext,
    plan_id: str,
    hanko_cookie: str | None = None,
    *,
    refresh: bool = False,
) -> PlanReadHydrated | None:
    """Return a plan the user may view. Default serves the stored snapshot
    instantly; ``refresh=True`` hydrates live and persists the fresh snapshot."""
    plan = await get_viewable_plan(db, ctx, plan_id)
    if plan is None:
        return None

    if not refresh:
        return _build_plan_response(plan, [_item_from_snapshot(row) for row in plan.projects], ctx)

    items = await _hydrate_live_and_persist(db, plan, hanko_cookie)
    return _build_plan_response(plan, items, ctx)


async def get_public_plan_hydrated(
    db: AsyncSession,
    plan_id: str,
    hanko_cookie: str | None = None,
    *,
    refresh: bool = False,
) -> PlanReadHydrated | None:
    """Fetch a plan by ID only if visibility=public. No owner check.

    Default serves the stored snapshot instantly; ``refresh=True`` hydrates live
    and persists the fresh snapshot (stale-while-revalidate)."""
    stmt = (
        select(Plan)
        .where(Plan.id == plan_id, Plan.visibility == "public")
        .options(
            selectinload(Plan.projects),
            selectinload(Plan.collections),
            selectinload(Plan.images),
        )
    )
    result = await db.execute(stmt)
    plan = result.scalar_one_or_none()
    if plan is None:
        return None

    # An anonymous public viewer has no edit rights.
    anon_ctx = permissions.PermissionContext(None, frozenset(), True)
    if not refresh:
        return _build_plan_response(
            plan,
            [_item_from_snapshot(row) for row in plan.projects],
            anon_ctx,
        )

    items = await _hydrate_live_and_persist(db, plan, hanko_cookie)
    return _build_plan_response(plan, items, anon_ctx)


async def get_plan_tags_for_projects(
    db: AsyncSession,
    owner_id: str,
    app: AppLiteral,
    project_ids: list[str],
) -> dict[str, list[PlanTag]]:
    """Return a map `project_id -> [PlanTag]` for each id that belongs to any plan of owner."""
    if not project_ids:
        return {}

    stmt = (
        select(PlanProject.project_id, Plan.id, Plan.name)
        .join(Plan, Plan.id == PlanProject.plan_id)
        .where(
            Plan.owner_id == owner_id,
            PlanProject.app == app,
            PlanProject.project_id.in_(project_ids),
        )
    )
    result = await db.execute(stmt)
    mapping: dict[str, list[PlanTag]] = defaultdict(list)
    for project_id, plan_id, plan_name in result.all():
        mapping[project_id].append(PlanTag(id=plan_id, name=plan_name))
    return mapping


async def enrich_items_with_plans(
    db: AsyncSession,
    owner_id: str | None,
    app: AppLiteral,
    items: list,
    id_key: str,
) -> list:
    """Return a deep copy of ``items`` with a `plans: list[PlanTag]` field on each item.

    If ``owner_id`` is None, returns a copy with empty `plans` on each item without touching the DB.
    The items input must not be mutated so cached data stays user-agnostic.
    """
    items_copy = copy.deepcopy(items)
    if owner_id is None:
        for item in items_copy:
            if isinstance(item, dict):
                item["plans"] = []
        return items_copy

    ids = []
    for item in items_copy:
        if not isinstance(item, dict):
            continue
        raw_id = item.get(id_key)
        if raw_id is not None:
            ids.append(str(raw_id))
    tags = await get_plan_tags_for_projects(db, owner_id, app, ids)
    return attach_plan_tags(items_copy, tags, id_key)


def attach_plan_tags(
    items: list[dict],
    tags: dict[str, list[PlanTag]],
    id_key: str,
) -> list[dict]:
    """Mutate and return items adding a `plans` field based on `tags` mapping.

    `id_key` is the dict key holding the project id in each item. Ids are coerced to str.
    """
    for item in items:
        if not isinstance(item, dict):
            continue
        raw_id = item.get(id_key)
        if raw_id is None:
            item["plans"] = []
            continue
        item["plans"] = [t.model_dump() for t in tags.get(str(raw_id), [])]
    return items


# Canonical production base URLs used only when resolving a user-pasted URL.
# Plan hydration goes through APP_FETCHERS or explicit special cases, which respect env config.
_CANONICAL_RESOLVE: dict[str, tuple] = {
    "drone-tasking-manager": (drone_tm_service.fetch_project_by_id, "https://api.drone.hotosm.org"),
    "fair": (fair_service.fetch_model_by_id, "https://api-prod.fair.hotosm.org/api/v1"),
    "export-tool": (export_tool_service.fetch_job_by_uid, "https://export.hotosm.org/api"),
    "open-aerial-map": (
        open_aerial_map_service.fetch_imagery_by_id,
        "https://api.openaerialmap.org",
    ),
    "umap": (umap_service.fetch_map_by_id, "https://umap.hotosm.org"),
}

# ChatMap plan projects always live on chatmap.hotosm.org, so URL resolution
# always verifies against the production API (requires a valid production Hanko cookie).
_CHATMAP_RESOLVE_API_URL = "https://chatmap.hotosm.org/api/v1"


async def _fetch_by_app_project(
    app: str,
    project_id: str,
    hanko_cookie: str | None = None,
) -> UrlResolveResponse:
    """Fetch upstream data for a known app+project_id pair.

    Raises ProjectNotFoundError or UpstreamUnavailable.
    """
    try:
        if app == "chatmap":
            upstream = await chatmap_service.fetch_map_by_id(
                project_id,
                base_url=_CHATMAP_RESOLVE_API_URL,
                hanko_cookie=hanko_cookie,
            )
            if upstream is None and hanko_cookie:
                upstream = await chatmap_service.fetch_map_by_id(
                    project_id,
                    base_url=_CHATMAP_RESOLVE_API_URL,
                    hanko_cookie=None,
                )
            # ChatMap private maps may be inaccessible outside production — accept None.
            return UrlResolveResponse(app=app, project_id=project_id, upstream=upstream)
        elif app in _CANONICAL_RESOLVE:
            fetcher, canonical_base = _CANONICAL_RESOLVE[app]
            upstream = await fetcher(project_id, base_url=canonical_base)
        else:
            upstream = await APP_FETCHERS[app](project_id)
    except Exception as e:
        raise UpstreamUnavailable(app) from e

    if upstream is None:
        raise ProjectNotFoundError(f"{app}:{project_id}")
    return UrlResolveResponse(app=app, project_id=project_id, upstream=upstream)


async def resolve_project_url(url: str, hanko_cookie: str | None = None) -> UrlResolveResponse:
    """Parse a project URL, verify it exists upstream, and return app/project_id/upstream.

    Raises:
        InvalidUrlError: URL does not match any supported app pattern.
        ProjectNotFoundError: URL parses successfully but project does not exist upstream.
        UpstreamUnavailable: Upstream service is unreachable or returned an error.
    """
    from urllib.parse import urlparse

    parsed = url_resolver.parse_project_url(url)
    if parsed is None:
        raise InvalidUrlError(url)
    app, project_id = parsed

    if app == "field-tm":
        p = urlparse(url)
        base = f"{p.scheme}://{p.netloc}"
        upstream = await field_tm_service.fetch_project_by_id(project_id, base_url=base)
        return UrlResolveResponse(app=app, project_id=project_id, upstream=upstream)

    if app == "open-aerial-map" and open_aerial_map_service.is_tms_project_id(project_id):
        # TMS tile URLs don't carry OAM's _id, so verifying/titling them means
        # paging through OAM's whole /meta catalog (no indexed lookup by uuid
        # exists) — measured up to ~20s. Don't block adding the project on that;
        # accept it immediately and let the title fill in on a later plan
        # hydration, while warming its page cache in the background so that
        # hydration is likely to find it already cached instead of repeating
        # the same slow search.
        open_aerial_map_service.schedule_tms_warmup(project_id)
        return UrlResolveResponse(app=app, project_id=project_id, upstream=None)

    return await _fetch_by_app_project(app, project_id, hanko_cookie=hanko_cookie)

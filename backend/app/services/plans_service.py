"""Service layer for user-owned plans: CRUD, hydration, and tag lookups."""

import asyncio
import copy
from collections import defaultdict

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.plan import Plan, PlanProject
from app.models.plan import (
    AppLiteral,
    HydratedProjectItem,
    PlanCreate,
    PlanProjectItem,
    PlanRead,
    PlanReadHydrated,
    PlanTag,
    PlanUpdate,
)
from app.services import (
    drone_tm_service,
    export_tool_service,
    fair_service,
    field_tm_service,
    open_aerial_map_service,
    tasking_manager_service,
    umap_service,
)
from app.services.exceptions import UpstreamUnavailable


class DuplicateProjectError(ValueError):
    """Raised when a plan payload contains duplicate (app, project_id) entries."""


APP_FETCHERS = {
    "tasking-manager": tasking_manager_service.fetch_project_by_id,
    "field-tm": field_tm_service.fetch_project_by_id,
    "drone-tasking-manager": drone_tm_service.fetch_project_by_id,
    "fair": fair_service.fetch_model_by_id,
    "open-aerial-map": open_aerial_map_service.fetch_imagery_by_id,
    "export-tool": export_tool_service.fetch_job_by_uid,
    "umap": umap_service.fetch_map_by_location,
}


def _plan_to_read(plan: Plan) -> PlanRead:
    return PlanRead(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        projects=[
            PlanProjectItem(app=row.app, project_id=row.project_id, data=row.data)
            for row in plan.projects
        ],
    )


def _check_no_duplicates(items: list[PlanProjectItem]) -> None:
    seen: set[tuple[str, str]] = set()
    for item in items:
        key = (item.app, item.project_id)
        if key in seen:
            raise DuplicateProjectError(
                f"Duplicate project in payload: app={item.app} project_id={item.project_id}"
            )
        seen.add(key)


async def list_plans(db: AsyncSession, owner_id: str) -> list[PlanRead]:
    stmt = (
        select(Plan)
        .where(Plan.owner_id == owner_id)
        .options(selectinload(Plan.projects))
        .order_by(Plan.created_at.desc())
    )
    result = await db.execute(stmt)
    plans = result.scalars().all()
    return [_plan_to_read(p) for p in plans]


async def _get_owned_plan(
    db: AsyncSession, owner_id: str, plan_id: str
) -> Plan | None:
    stmt = (
        select(Plan)
        .where(Plan.id == plan_id, Plan.owner_id == owner_id)
        .options(selectinload(Plan.projects))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_plan(
    db: AsyncSession, owner_id: str, payload: PlanCreate
) -> PlanRead:
    _check_no_duplicates(payload.projects)

    plan = Plan(
        owner_id=owner_id,
        name=payload.name,
        description=payload.description,
    )
    db.add(plan)
    await db.flush()

    for item in payload.projects:
        db.add(
            PlanProject(
                plan_id=plan.id,
                app=item.app,
                project_id=item.project_id,
                data=item.data,
            )
        )

    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateProjectError(str(e)) from e

    await db.refresh(plan, attribute_names=["projects"])
    return _plan_to_read(plan)


async def update_plan(
    db: AsyncSession, owner_id: str, plan_id: str, payload: PlanUpdate
) -> PlanRead | None:
    plan = await _get_owned_plan(db, owner_id, plan_id)
    if plan is None:
        return None

    if payload.name is not None:
        plan.name = payload.name
    if payload.description is not None:
        plan.description = payload.description

    if payload.projects is not None:
        _check_no_duplicates(payload.projects)
        await db.execute(
            delete(PlanProject).where(PlanProject.plan_id == plan.id)
        )
        await db.flush()
        for item in payload.projects:
            db.add(
                PlanProject(
                    plan_id=plan.id,
                    app=item.app,
                    project_id=item.project_id,
                    data=item.data,
                )
            )

    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateProjectError(str(e)) from e

    await db.refresh(plan, attribute_names=["projects"])
    return _plan_to_read(plan)


async def delete_plan(db: AsyncSession, owner_id: str, plan_id: str) -> bool:
    plan = await _get_owned_plan(db, owner_id, plan_id)
    if plan is None:
        return False
    await db.delete(plan)
    await db.flush()
    return True


async def _hydrate_one(row: PlanProject) -> HydratedProjectItem:
    fetcher = APP_FETCHERS.get(row.app)
    if fetcher is None:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            data=row.data,
            upstream=None,
            error="not_found",
        )
    try:
        upstream = await fetcher(row.project_id)
    except UpstreamUnavailable:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            data=row.data,
            upstream=None,
            error="upstream_unavailable",
        )
    if upstream is None:
        return HydratedProjectItem(
            app=row.app,
            project_id=row.project_id,
            data=row.data,
            upstream=None,
            error="not_found",
        )
    return HydratedProjectItem(
        app=row.app,
        project_id=row.project_id,
        data=row.data,
        upstream=upstream,
        error=None,
    )


async def get_plan_hydrated(
    db: AsyncSession, owner_id: str, plan_id: str
) -> PlanReadHydrated | None:
    plan = await _get_owned_plan(db, owner_id, plan_id)
    if plan is None:
        return None

    hydrated_items = await asyncio.gather(
        *[_hydrate_one(row) for row in plan.projects]
    )

    return PlanReadHydrated(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        projects=list(hydrated_items),
    )


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

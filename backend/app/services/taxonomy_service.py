"""Service layer for Groups and Tags: open-text taxonomies on plan projects.

Groups and Tags are owned per-user (optionally shared with a login team/
organization), not per-plan — see app/db/models/taxonomy.py for the scope
model. Assigning them to a specific plan project/task lives in
plans_service.py (set_project_groups/set_project_tags) since that operates
on PlanProject, which belongs to a Plan.
"""

from sqlalchemy import and_, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.taxonomy import Group, Tag
from app.models.taxonomy import (
    GroupCreate,
    GroupRead,
    GroupUpdate,
    TagCreate,
    TagRead,
    TagUpdate,
)
from app.services import permissions
from app.services.permissions import PermissionContext


class DuplicateNameError(ValueError):
    """Raised when a Group/Tag name already exists within the same owner/group scope."""


class GroupMembershipError(ValueError):
    """Raised when assigning a Group/Tag to a login group the user does not belong to."""


def _visible_condition(model: type[Group] | type[Tag], ctx: PermissionContext):
    conditions = [model.owner_id == ctx.user_id]
    group_conditions = [
        and_(model.group_type == gtype, model.group_id == gid)
        for (gtype, gid) in ctx.memberships
    ]
    if group_conditions:
        conditions.append(or_(*group_conditions))
    return or_(*conditions)


async def _get_visible(
    db: AsyncSession, model: type[Group] | type[Tag], ctx: PermissionContext, entity_id: str
):
    stmt = select(model).where(model.id == entity_id)
    result = await db.execute(stmt)
    entity = result.scalar_one_or_none()
    if entity is None or not permissions.owns_or_member(
        entity.owner_id, entity.group_type, entity.group_id, ctx
    ):
        return None
    return entity


async def _raise_if_duplicate(
    db: AsyncSession,
    model: type[Group] | type[Tag],
    owner_id: str,
    group_type: str | None,
    group_id: str | None,
    name: str,
    exclude_id: str | None = None,
) -> None:
    """Check for an existing row with the same (scope, name).

    The DB UniqueConstraint alone doesn't catch this for personal (unscoped)
    entities: SQL treats NULL <> NULL, so two rows with group_type/group_id
    both NULL never collide at the constraint level. This app-level check
    covers that case; the DB constraint remains a backstop for concurrent
    inserts within the same team/org scope.
    """
    stmt = select(model.id).where(
        model.owner_id == owner_id,
        model.group_type == group_type,
        model.group_id == group_id,
        model.name == name,
    )
    if exclude_id is not None:
        stmt = stmt.where(model.id != exclude_id)
    result = await db.execute(stmt)
    if result.scalar_one_or_none() is not None:
        raise DuplicateNameError(f"'{name}' already exists in this scope")


async def list_groups(db: AsyncSession, ctx: PermissionContext) -> list[GroupRead]:
    """List groups visible to ctx: owned, plus shared with ctx's login groups."""
    stmt = select(Group).where(_visible_condition(Group, ctx)).order_by(Group.name)
    result = await db.execute(stmt)
    return [GroupRead.model_validate(g) for g in result.scalars().all()]


async def create_group(
    db: AsyncSession, ctx: PermissionContext, payload: GroupCreate
) -> GroupRead:
    if payload.group_id is not None and not permissions.is_member(
        ctx, payload.group_type, payload.group_id
    ):
        raise GroupMembershipError("Not a member of the target group")
    await _raise_if_duplicate(
        db, Group, ctx.user_id, payload.group_type, payload.group_id, payload.name
    )
    group = Group(
        owner_id=ctx.user_id,
        group_type=payload.group_type,
        group_id=payload.group_id,
        name=payload.name,
        description=payload.description,
    )
    db.add(group)
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateNameError(str(e)) from e
    await db.refresh(group)
    return GroupRead.model_validate(group)


async def update_group(
    db: AsyncSession, ctx: PermissionContext, group_id: str, payload: GroupUpdate
) -> GroupRead | None:
    group = await _get_visible(db, Group, ctx, group_id)
    if group is None:
        return None
    if payload.name is not None:
        await _raise_if_duplicate(
            db,
            Group,
            group.owner_id,
            group.group_type,
            group.group_id,
            payload.name,
            exclude_id=group.id,
        )
        group.name = payload.name
    if payload.description is not None:
        group.description = payload.description
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateNameError(str(e)) from e
    await db.refresh(group)
    return GroupRead.model_validate(group)


async def delete_group(db: AsyncSession, ctx: PermissionContext, group_id: str) -> bool:
    """Delete a group. Cascades plan_project_groups rows automatically, so any
    plan project that only had this group falls back to the virtual "All" bucket."""
    group = await _get_visible(db, Group, ctx, group_id)
    if group is None:
        return False
    await db.delete(group)
    await db.flush()
    return True


async def get_visible_groups(
    db: AsyncSession, ctx: PermissionContext, group_ids: list[str]
) -> list[Group]:
    """Return the subset of `group_ids` that exist and are visible to ctx."""
    if not group_ids:
        return []
    stmt = select(Group).where(
        Group.id.in_(group_ids), _visible_condition(Group, ctx)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def list_tags(db: AsyncSession, ctx: PermissionContext) -> list[TagRead]:
    """List tags visible to ctx: owned, plus shared with ctx's login groups."""
    stmt = select(Tag).where(_visible_condition(Tag, ctx)).order_by(Tag.name)
    result = await db.execute(stmt)
    return [TagRead.model_validate(t) for t in result.scalars().all()]


async def create_tag(
    db: AsyncSession, ctx: PermissionContext, payload: TagCreate
) -> TagRead:
    if payload.group_id is not None and not permissions.is_member(
        ctx, payload.group_type, payload.group_id
    ):
        raise GroupMembershipError("Not a member of the target group")
    await _raise_if_duplicate(
        db, Tag, ctx.user_id, payload.group_type, payload.group_id, payload.name
    )
    tag = Tag(
        owner_id=ctx.user_id,
        group_type=payload.group_type,
        group_id=payload.group_id,
        name=payload.name,
    )
    db.add(tag)
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateNameError(str(e)) from e
    await db.refresh(tag)
    return TagRead.model_validate(tag)


async def update_tag(
    db: AsyncSession, ctx: PermissionContext, tag_id: str, payload: TagUpdate
) -> TagRead | None:
    tag = await _get_visible(db, Tag, ctx, tag_id)
    if tag is None:
        return None
    await _raise_if_duplicate(
        db, Tag, tag.owner_id, tag.group_type, tag.group_id, payload.name, exclude_id=tag.id
    )
    tag.name = payload.name
    try:
        await db.flush()
    except IntegrityError as e:
        await db.rollback()
        raise DuplicateNameError(str(e)) from e
    await db.refresh(tag)
    return TagRead.model_validate(tag)


async def delete_tag(db: AsyncSession, ctx: PermissionContext, tag_id: str) -> bool:
    """Delete a tag. Cascades plan_project_tags rows automatically."""
    tag = await _get_visible(db, Tag, ctx, tag_id)
    if tag is None:
        return False
    await db.delete(tag)
    await db.flush()
    return True


async def get_visible_tags(
    db: AsyncSession, ctx: PermissionContext, tag_ids: list[str]
) -> list[Tag]:
    """Return the subset of `tag_ids` that exist and are visible to ctx."""
    if not tag_ids:
        return []
    stmt = select(Tag).where(Tag.id.in_(tag_ids), _visible_condition(Tag, ctx))
    result = await db.execute(stmt)
    return list(result.scalars().all())

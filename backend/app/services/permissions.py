"""Plan authorization: view/edit resolution over group membership.

The permission context resolves the user's group memberships once per request
(no N+1 when authorizing a list of plans). Owner checks are 100% local, so an
owner can always view/edit their plans even if login is down; non-owner access
to group plans fails closed when membership can't be verified.
"""

from dataclasses import dataclass

from app.services import login_service


@dataclass(frozen=True)
class PermissionContext:
    """A request-scoped snapshot of who the user is and what they belong to."""

    user_id: str | None
    memberships: frozenset[tuple[str, str]]  # {(group_type, group_id)}
    login_ok: bool


async def build_context(user, hanko_cookie: str | None) -> PermissionContext:
    """Build the permission context, resolving group memberships once.

    Anonymous users have no memberships. If login can't be reached, we fail
    closed (empty memberships, login_ok=False) — owner checks are still local.
    """
    if user is None:
        return PermissionContext(None, frozenset(), True)
    try:
        groups = await login_service.get_user_groups(user.id, hanko_cookie)
    except login_service.LoginUnavailable:
        return PermissionContext(user.id, frozenset(), False)
    memberships = frozenset((g.type, g.id) for g in groups)
    return PermissionContext(user.id, memberships, True)


def can_view(plan, ctx: PermissionContext) -> bool:
    """Whether the context may view the plan."""
    if plan.visibility == "public":
        return True
    if ctx.user_id and ctx.user_id == plan.owner_id:
        return True
    if plan.group_id is None:
        return False
    if plan.visibility == "group" and is_member(
        ctx, plan.group_type, plan.group_id
    ):
        return True
    return False


def can_edit(plan, ctx: PermissionContext) -> bool:
    """Whether the context may edit the plan (owner is always allowed)."""
    if ctx.user_id is None:
        return False
    if ctx.user_id == plan.owner_id:
        return True
    return (
        plan.group_id is not None
        and plan.edit_scope == "group"
        and is_member(ctx, plan.group_type, plan.group_id)
    )


def is_member(
    ctx: PermissionContext, group_type: str | None, group_id: str | None
) -> bool:
    """Whether the context's user belongs to the given group."""
    if group_type is None or group_id is None:
        return False
    return (group_type, group_id) in ctx.memberships

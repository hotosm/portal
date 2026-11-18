"""Plan authorization: ownership + grants resolved over group membership.

The permission context resolves the user's group memberships once per request
(no N+1 when authorizing a list of plans). The owner check is 100% local, so
an owner can always view/edit their plans even if login is down; everything
that depends on membership fails closed when login can't be reached.
"""

from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import Literal

from app.services import login_service


@dataclass(frozen=True)
class PermissionContext:
    """A request-scoped snapshot of who the user is and what they belong to."""

    user_id: str | None
    memberships: dict[tuple[str, str], str]  # {(group_type, group_id): role}
    login_ok: bool
    # {(group_type, group_id): name} for the same groups, to label their plans.
    group_names: dict[tuple[str, str], str] = field(default_factory=dict)
    # {(group_type, group_id): slug} for the same groups, to link their plans.
    group_slugs: dict[tuple[str, str], str] = field(default_factory=dict)
    # The user's username, stored on the plans they create.
    user_name: str | None = None
    # Only used to derive the author label (the part before the "@"); the full
    # address is never stored or returned.
    user_email: str | None = None
    # {(group_type, group_id)} of the memberships login reports as approved.
    approved: frozenset[tuple[str, str]] = frozenset()


async def build_context(user, hanko_cookie: str | None) -> PermissionContext:
    """Build the permission context, resolving group memberships once.

    Anonymous users have no memberships. If login can't be reached, we fail
    closed (empty memberships, login_ok=False) — owner checks are still local.
    """
    if user is None:
        return PermissionContext(None, {}, True)
    user_name = getattr(user, "username", None) or None
    user_email = getattr(user, "email", None) or None
    try:
        groups = await login_service.get_user_groups(user.id, hanko_cookie)
    except login_service.LoginUnavailable:
        return PermissionContext(user.id, {}, False, user_name=user_name, user_email=user_email)
    memberships = {(g.type, g.id): g.role for g in groups}
    group_names = {(g.type, g.id): g.name for g in groups if g.name}
    group_slugs = {(g.type, g.id): g.slug for g in groups if g.slug}
    return PermissionContext(
        user.id,
        memberships,
        True,
        group_names,
        group_slugs,
        user_name=user_name,
        user_email=user_email,
        approved=frozenset((g.type, g.id) for g in groups if g.status == "approved"),
    )


Role = Literal["viewer", "editor", "owner"]

_RANK: dict[str, int] = {"viewer": 1, "editor": 2, "owner": 3}

# Org roles that may attribute a plan to the organization.
ORG_MANAGER_ROLES = frozenset({"owner", "manager"})


def is_org_manager(ctx: PermissionContext, org_id: str | None) -> bool:
    """Whether the user is an approved owner/manager of the organization."""
    key = ("organization", org_id)
    return key in ctx.approved and ctx.memberships.get(key) in ORG_MANAGER_ROLES


def effective_role(plan, grants: Iterable, ctx: PermissionContext) -> Role | None:
    """The highest role the context holds on the plan, or None for no access.

    owner: the plan's owner_id, checked locally (works when login is down).
    The organization a plan is attributed to gets no role from it. Otherwise
    the best of the user's own grant, grants to any team/org they belong to,
    and the "anyone with the link" grant.
    """
    if ctx.user_id is not None and ctx.user_id == plan.owner_id:
        return "owner"

    best: Role | None = None
    for grant in grants:
        if grant.subject_type == "link":
            matches = True
        elif grant.subject_type == "user":
            matches = ctx.user_id is not None and grant.subject_id == ctx.user_id
        else:
            matches = is_member(ctx, grant.subject_type, grant.subject_id)
        if matches and (best is None or _RANK[grant.role] > _RANK[best]):
            best = grant.role
    return best


def _role(plan, ctx: PermissionContext, grants: Iterable | None) -> Role | None:
    return effective_role(plan, plan.grants if grants is None else grants, ctx)


def can_view(plan, ctx: PermissionContext, grants: Iterable | None = None) -> bool:
    """Whether the context may view the plan (viewer or above)."""
    return _role(plan, ctx, grants) is not None


def can_edit(plan, ctx: PermissionContext, grants: Iterable | None = None) -> bool:
    """Whether the context may edit the plan (editor or above)."""
    role = _role(plan, ctx, grants)
    return role is not None and _RANK[role] >= _RANK["editor"]


def can_manage(plan, ctx: PermissionContext, grants: Iterable | None = None) -> bool:
    """Whether the context owns the plan (share, attribute, delete)."""
    return _role(plan, ctx, grants) == "owner"


def is_member(ctx: PermissionContext, group_type: str | None, group_id: str | None) -> bool:
    """Whether the context's user belongs to the given group."""
    if group_type is None or group_id is None:
        return False
    return (group_type, group_id) in ctx.memberships


def owns_or_member(
    owner_id: str,
    group_type: str | None,
    group_id: str | None,
    ctx: PermissionContext,
) -> bool:
    """Whether ctx may view/edit a scoped entity (e.g. a Group or Tag).

    True if ctx is the owner, or the entity is shared with a team/organization
    ctx belongs to. Unlike Plan, these entities have no grants — any member of
    the owning group may edit.
    """
    if ctx.user_id is not None and ctx.user_id == owner_id:
        return True
    return is_member(ctx, group_type, group_id)

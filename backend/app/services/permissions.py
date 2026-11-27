"""Plan authorization: ownership + grants resolved over group membership.

The rules (roles, permissions, how grants resolve) come from
``hotosm-permissions``; this module wraps them with Portal's own context
fields. The permission context resolves the user's group memberships once per
request (no N+1 when authorizing a list of plans). The owner check is 100%
local, so an owner can always view/edit their plans even if login is down;
everything that depends on membership fails closed when login can't be
reached.
"""

from collections.abc import Iterable
from dataclasses import dataclass, field

import hotosm_permissions as hp

from app.services import login_service

PORTAL_CATALOG = hp.ToolCatalog(
    tool="portal",
    available_roles=("viewer", "editor", "owner"),
    permissions=(
        hp.Permission("portal:plans.view", "View a plan"),
        hp.Permission("portal:plans.edit", "Edit a plan and its projects"),
        hp.Permission("portal:plans.share", "Share a plan with others"),
        hp.Permission("portal:plans.attribute", "Attribute a plan to an organization"),
        hp.Permission("portal:plans.delete", "Delete a plan"),
        hp.Permission("portal:plans.transfer", "Transfer a plan to another person"),
    ),
    role_permissions={
        "viewer": ("portal:plans.view",),
        "editor": ("portal:plans.edit",),
        "owner": (
            "portal:plans.share",
            "portal:plans.attribute",
            "portal:plans.delete",
            "portal:plans.transfer",
        ),
    },
)

PORTAL_ROLES = hp.ToolRoles(PORTAL_CATALOG)


@dataclass(frozen=True)
class PermissionContext:
    """A request-scoped snapshot of who the user is and what they belong to.

    ``core`` is the library's context (user id, approved memberships, whether
    login answered); the other fields are Portal-only.
    """

    core: hp.PermissionContext
    # {(group_type, group_id): name} for the user's groups, to label their plans.
    group_names: dict[tuple[str, str], str] = field(default_factory=dict)
    # {(group_type, group_id): slug} for the same groups, to link their plans.
    group_slugs: dict[tuple[str, str], str] = field(default_factory=dict)
    # The user's username, stored on the plans they create.
    user_name: str | None = None
    # Only used to derive the author label (the part before the "@"); the full
    # address is never stored or returned.
    user_email: str | None = None

    @property
    def user_id(self) -> str | None:
        return self.core.user_id

    @property
    def login_ok(self) -> bool:
        return self.core.login_ok

    @classmethod
    def anonymous(cls) -> "PermissionContext":
        """Context for a request without a logged-in user."""
        return cls(hp.PermissionContext.anonymous())


async def build_context(user, hanko_cookie: str | None) -> PermissionContext:
    """Build the permission context, resolving group memberships once.

    Anonymous users have no memberships. If login can't be reached, we fail
    closed (empty memberships, login_ok=False) — owner checks are still local.
    """
    if user is None:
        return PermissionContext.anonymous()
    user_name = getattr(user, "username", None) or None
    user_email = getattr(user, "email", None) or None
    try:
        groups = await login_service.get_user_groups(user.id, hanko_cookie)
    except login_service.LoginUnavailable:
        return PermissionContext(
            hp.PermissionContext.login_unavailable(user.id),
            user_name=user_name,
            user_email=user_email,
        )
    group_names = {(g.type, g.id): g.name for g in groups if g.name}
    group_slugs = {(g.type, g.id): g.slug for g in groups if g.slug}
    return PermissionContext(
        hp.PermissionContext.from_login_groups(user.id, groups),
        group_names,
        group_slugs,
        user_name=user_name,
        user_email=user_email,
    )


def is_org_manager(ctx: PermissionContext, org_id: str | None) -> bool:
    """Whether the user is an approved owner/manager of the organization."""
    return ctx.core.is_org_manager(org_id)


def effective_role(plan, grants: Iterable, ctx: PermissionContext) -> hp.Role | None:
    """The highest role the context holds on the plan, or None for no access.

    owner: the plan's owner_id, checked locally (works when login is down).
    The organization a plan is attributed to gets no role from it. Otherwise
    the best of the user's own grant, grants to any approved team/org they
    belong to, and the "anyone with the link" grant.
    """
    return hp.effective_role(plan.owner_id, grants, ctx.core, PORTAL_ROLES)


def _can(permission: str, plan, ctx: PermissionContext, grants: Iterable | None) -> bool:
    return hp.can(
        permission,
        plan.owner_id,
        plan.grants if grants is None else grants,
        ctx.core,
        PORTAL_ROLES,
    )


def can_view(plan, ctx: PermissionContext, grants: Iterable | None = None) -> bool:
    """Whether the context may view the plan (viewer or above)."""
    return _can("portal:plans.view", plan, ctx, grants)


def can_edit(plan, ctx: PermissionContext, grants: Iterable | None = None) -> bool:
    """Whether the context may edit the plan (editor or above)."""
    return _can("portal:plans.edit", plan, ctx, grants)


def can_manage(plan, ctx: PermissionContext, grants: Iterable | None = None) -> bool:
    """Whether the context owns the plan (share, attribute, delete)."""
    return _can("portal:plans.share", plan, ctx, grants)


def is_member(ctx: PermissionContext, group_type: str | None, group_id: str | None) -> bool:
    """Whether the context's user belongs to the given approved group."""
    return ctx.core.is_member(group_type, group_id)


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

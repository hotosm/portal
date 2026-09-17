"""Client for the login service's group membership and profile APIs.

Portal resolves "which groups does this user belong to?" by calling login's
``GET /api/groups`` (the canonical consumer contract), forwarding the user's
hanko cookie. Results are cached briefly; failures are never cached and raise
``LoginUnavailable`` so callers can fail closed for non-owners.

The profile-account functions below (``get_account_profile``,
``get_public_account_profile``, ``get_public_user_groups_by_slug``) call
login's unauthenticated profile routes directly — no cookie forwarding needed.
Portal never mirrors login's account fields (name, picture, slug, is_public)
in its own database; it asks login live on every request.
"""

from dataclasses import dataclass
from typing import Literal

import httpx

from app.core.cache import SHORT_TTL, get_cached, set_cached
from app.core.config import settings

# Membership is security-sensitive, so keep the staleness window short.
GROUPS_TTL = SHORT_TTL  # 60s
# Below the hydrate fetcher timeout (8s) and Traefik's gateway timeout (30s).
_REQUEST_TIMEOUT = 5.0


@dataclass(frozen=True)
class UserGroup:
    """A group the user belongs to, as reported by login."""

    id: str
    type: str
    slug: str
    name: str
    role: str
    status: str


class LoginUnavailable(Exception):
    """Raised when login cannot be reached (never cached)."""


def _parse(payload: dict) -> list[UserGroup]:
    groups = []
    for g in payload.get("groups", []):
        groups.append(
            UserGroup(
                id=g["id"],
                type=g["type"],
                slug=g.get("slug", ""),
                name=g.get("name", ""),
                role=g.get("role", "member"),
                status=g.get("status", "approved"),
            )
        )
    return groups


def _cache_key(user_id: str) -> str:
    return f"login_user_groups_{user_id}"


async def get_user_groups(
    user_id: str,
    hanko_cookie: str | None,
    *,
    force_refresh: bool = False,
) -> list[UserGroup]:
    """Return the user's groups, cached for GROUPS_TTL.

    Returns an empty list when the feature is disabled or login reports no
    valid session (401/403). Raises LoginUnavailable on network/HTTP errors.
    """
    key = _cache_key(user_id)
    if not force_refresh:
        cached = get_cached(key)
        if cached is not None:
            return cached

    if not settings.login_groups_enabled:
        return []

    base = (settings.login_api_url or settings.hanko_api_url or "").rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{base}/api/groups",
                cookies={"hanko": hanko_cookie} if hanko_cookie else {},
                headers={"accept": "application/json"},
            )
            if response.status_code in (401, 403):
                groups: list[UserGroup] = []
            else:
                response.raise_for_status()
                groups = _parse(response.json())
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        raise LoginUnavailable(str(exc)) from exc

    set_cached(key, groups, GROUPS_TTL)
    return groups


def invalidate_user_groups(user_id: str) -> None:
    """Drop a user's cached groups (call after a membership change)."""
    from app.core.cache import delete_cached

    delete_cached(_cache_key(user_id))


# ── Profile (account) fields ─────────────────────────────────────────────────
#
# These target login's unauthenticated profile routes, so no hanko cookie is
# forwarded. "Unauthenticated" here just means login doesn't gate them; the
# by-id route requires knowing a real hanko_user_id (portal's own JWT-verified
# user.id), and the by-slug route requires the user having opted into
# is_public on login's side.

_PROFILE_TTL = SHORT_TTL  # 60s — public lookups only, see functions below.


@dataclass(frozen=True)
class AccountProfile:
    """Account-identity fields for a user, as reported by login."""

    hanko_user_id: str
    first_name: str | None
    last_name: str | None
    picture_url: str | None
    slug: str | None
    is_public: bool
    osm_username: str | None
    osm_avatar_url: str | None


@dataclass(frozen=True)
class PublicAccountProfile:
    """Account-identity fields for a public-by-slug lookup."""

    hanko_user_id: str  # join key for Portal's own tables; never expose to clients
    slug: str
    first_name: str | None
    last_name: str | None
    picture_url: str | None


def _login_base_url() -> str:
    return (settings.login_api_url or settings.hanko_api_url or "").rstrip("/")


async def get_account_profile(hanko_user_id: str) -> AccountProfile | None:
    """Fetch account-identity fields for the given user from login.

    Calls login's ``GET /api/profile/{hanko_user_id}``. Returns None on a 404
    (no login profile for this user yet). Raises LoginUnavailable on network
    errors, timeouts, or other non-2xx/404 responses. Never cached — used for
    the authenticated /me endpoint, which must reflect the latest state.
    """
    base = _login_base_url()
    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{base}/api/profile/{hanko_user_id}",
                headers={"accept": "application/json"},
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        raise LoginUnavailable(str(exc)) from exc

    return AccountProfile(
        hanko_user_id=data["hanko_user_id"],
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        picture_url=data.get("picture_url"),
        slug=data.get("slug"),
        is_public=data.get("is_public", False),
        osm_username=data.get("osm_username"),
        osm_avatar_url=data.get("osm_avatar_url"),
    )


def _public_profile_cache_key(slug: str) -> str:
    return f"login_public_profile_{slug}"


async def get_public_account_profile(slug: str) -> PublicAccountProfile | None:
    """Fetch a public-by-slug account profile from login.

    Calls login's ``GET /api/public/user/{slug}``. Returns None on a 404
    (not public, or doesn't exist). Raises LoginUnavailable on network errors,
    timeouts, or other non-2xx/404 responses. Cached briefly (public data).
    """
    key = _public_profile_cache_key(slug)
    cached = get_cached(key)
    if cached is not None:
        return cached

    base = _login_base_url()
    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{base}/api/public/user/{slug}",
                headers={"accept": "application/json"},
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        raise LoginUnavailable(str(exc)) from exc

    profile = PublicAccountProfile(
        hanko_user_id=data["hanko_user_id"],
        slug=data["slug"],
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        picture_url=data.get("picture_url"),
    )
    set_cached(key, profile, _PROFILE_TTL)
    return profile


@dataclass(frozen=True)
class PublicGroup:
    """A public organization/team, as reported by login's public groups route."""

    type: str
    name: str
    slug: str
    description: str | None
    website: str | None
    avatar_url: str | None
    banner_url: str | None
    members_count: int


async def get_public_user_groups_by_slug(
    slug: str, group_type: Literal["org", "team"] = "org"
) -> list[PublicGroup]:
    """Fetch the public organizations/teams a user owns, by slug.

    Calls login's ``GET /api/public/user/{slug}/groups?type=...``. Only call
    this when the caller has already checked the matching portal_profiles row
    has the corresponding show_organizations/show_teams flag set to True.
    Raises LoginUnavailable on network errors, timeouts, or non-2xx responses
    (a 404 here means the profile itself vanished between calls — treat as
    unavailable rather than silently returning an empty list).
    """
    key = f"login_public_profile_groups_{slug}_{group_type}"
    cached = get_cached(key)
    if cached is not None:
        return cached

    base = _login_base_url()
    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{base}/api/public/user/{slug}/groups",
                params={"type": group_type},
                headers={"accept": "application/json"},
            )
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        raise LoginUnavailable(str(exc)) from exc

    groups = [
        PublicGroup(
            type=g.get("type", ""),
            name=g.get("name", ""),
            slug=g.get("slug", ""),
            description=g.get("description"),
            website=g.get("website"),
            avatar_url=g.get("avatar_url"),
            banner_url=g.get("banner_url"),
            members_count=g.get("members_count", 0),
        )
        for g in data.get("items", [])
    ]
    set_cached(key, groups, _PROFILE_TTL)
    return groups

"""Client for the login service's group membership API.

Portal resolves "which groups does this user belong to?" by calling login's
``GET /api/groups`` (the canonical consumer contract), forwarding the user's
hanko cookie. Results are cached briefly; failures are never cached and raise
``LoginUnavailable`` so callers can fail closed for non-owners.
"""

from dataclasses import dataclass

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

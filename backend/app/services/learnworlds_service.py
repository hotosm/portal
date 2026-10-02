"""Read course data from LearnWorlds (learn.hotosm.org), the HOT LMS.

Portal only reads here. The SSO flow — logging someone into the LMS — lives in
the login service and stays there.

Which LearnWorlds account belongs to a person is not ours to know: login owns
that mapping, because LearnWorlds is a SaaS with no database of ours behind it.
So this asks login first, then talks to LearnWorlds directly.

Two things about this API cost an afternoon to find out, so they are worth
stating: it answers 200 with ``success: false`` on errors, and a 404 can mean
"this user has no courses" rather than "no such route".
"""

import logging
from dataclasses import dataclass

import httpx

from app.core.cache import LONG_TTL, get_cached, set_cached
from app.core.config import settings

logger = logging.getLogger(__name__)

_REQUEST_TIMEOUT = 10.0
_HTTP_NOT_FOUND = 404

# Public profiles are read far more often than someone finishes a course, and
# every miss spends a call on a school-wide credential. Fifteen minutes of
# staleness is nobody's problem.
_COURSES_TTL = LONG_TTL

APP_NAME = "learnworlds"


class LearnWorldsUnavailable(Exception):
    """LearnWorlds could not be reached or answered with an error."""


@dataclass
class CourseSummary:
    """What a profile shows about someone's learning."""

    courses: int


def _is_configured() -> bool:
    return bool(
        settings.learnworlds_school_url
        and settings.learnworlds_client_id
        and settings.learnworlds_access_token
    )


async def _resolve_account_id(hanko_user_id: str) -> str | None:
    """Ask login which LearnWorlds account belongs to this person.

    Returns None when they have never used the LMS, which is an ordinary
    answer: the profile simply shows no learning section.
    """
    base = (settings.login_api_url or settings.hanko_api_url or "").rstrip("/")
    if not base or not settings.login_internal_api_key:
        return None

    key = f"learnworlds_mapping_{hanko_user_id}"
    cached = get_cached(key)
    if cached is not None:
        return cached or None

    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{base}/api/internal/mappings/{APP_NAME}/{hanko_user_id}",
                headers={"X-Internal-Key": settings.login_internal_api_key},
            )
            response.raise_for_status()
            account_id = response.json().get("app_user_id")
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.warning("Could not resolve the LearnWorlds mapping: %s", exc)
        return None

    # Cache the misses too, so profiles of people who never took a course do
    # not ask login on every view.
    set_cached(key, account_id or "", _COURSES_TTL)
    return account_id


async def get_course_summary(hanko_user_id: str) -> CourseSummary | None:
    """How many courses this person is enrolled in, or None when unknown.

    None covers every "nothing to show" case — not configured, no LMS account,
    LearnWorlds down — on purpose: a profile that cannot prove someone has
    courses should leave the section out rather than claim zero.
    """
    if not _is_configured():
        return None

    account_id = await _resolve_account_id(hanko_user_id)
    if not account_id:
        return None

    key = f"learnworlds_courses_{account_id}"
    cached = get_cached(key)
    if cached is not None:
        return cached

    school = settings.learnworlds_school_url.rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.get(
                f"{school}/admin/api/v2/users/{account_id}/courses",
                headers={
                    "Lw-Client": settings.learnworlds_client_id,
                    "Authorization": f"Bearer {settings.learnworlds_access_token}",
                },
            )
            if response.status_code == _HTTP_NOT_FOUND:
                payload = {}
            else:
                response.raise_for_status()
                payload = response.json()
                if payload.get("success") is False:
                    raise LearnWorldsUnavailable(str(payload.get("errors")))
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.warning("LearnWorlds did not answer for %s: %s", account_id, exc)
        return None
    except LearnWorldsUnavailable as exc:
        logger.warning("LearnWorlds rejected the request for %s: %s", account_id, exc)
        return None

    summary = CourseSummary(courses=int((payload.get("meta") or {}).get("totalItems") or 0))
    set_cached(key, summary, _COURSES_TTL)
    return summary

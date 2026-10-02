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

import asyncio
import logging
from dataclasses import dataclass
from datetime import UTC, datetime

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

# Progress costs one call per course, so only the first few are detailed. The
# total count comes from the listing's own meta and is not affected.
_MAX_COURSES_DETAILED = 12

APP_NAME = "learnworlds"


class LearnWorldsUnavailable(Exception):
    """LearnWorlds could not be reached or answered with an error."""


@dataclass
class Certificate:
    """One certificate someone earned, as a profile should show it.

    Deliberately narrower than what LearnWorlds returns: its payload carries
    the person's email and the name printed on the certificate, and none of
    that belongs on a public page.
    """

    title: str
    issued: datetime | None
    url: str | None


@dataclass
class Course:
    """A course someone is taking, with how far along they are."""

    title: str
    status: str
    progress_rate: int


@dataclass
class LearningSummary:
    """What a profile shows about someone's learning.

    Two different things, on purpose: courses count enrolments, certificates
    are finished work. Not every course issues one — it is a per-course
    setting in the school — so courses with an empty certificate list is an
    ordinary state, not a missing number.
    """

    courses: int
    certificates: list[Certificate]
    enrolled: list[Course]
    # Rounded down, and only when it reaches an hour: "0 hours" says nothing.
    hours: int | None = None
    # How many courses the school offers, so a profile can say "1 of 18"
    # instead of a number with nothing to compare it to. None when the
    # catalogue could not be read; the rest still renders.
    catalogue: int | None = None


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


async def _get(path: str, params: dict[str, str] | None = None) -> dict:
    """Read a listing. An empty one comes back as 404, not as an empty list.

    That is the API's own convention — "No certificates found" — so it is
    translated here into an empty payload rather than treated as a wrong URL.
    """
    school = settings.learnworlds_school_url.rstrip("/")
    async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
        response = await client.get(
            f"{school}/admin/api/v2/{path}",
            params=params,
            headers={
                "Lw-Client": settings.learnworlds_client_id,
                "Authorization": f"Bearer {settings.learnworlds_access_token}",
            },
        )
        if response.status_code == _HTTP_NOT_FOUND:
            return {}
        response.raise_for_status()
        payload = response.json()
        if payload.get("success") is False:
            raise LearnWorldsUnavailable(str(payload.get("errors")))
    return payload


async def _count(path: str, params: dict[str, str] | None = None) -> int:
    """How many items a listing holds, reading the count LearnWorlds reports."""
    payload = await _get(path, params)
    return int((payload.get("meta") or {}).get("totalItems") or 0)


def _certificate_from(payload: dict) -> Certificate | None:
    """Keep the few fields a profile shows, dropping the rest.

    Skips anything not currently valid: revoked certificates still come back
    with a status, and an expired one is not something to display as earned.
    """
    if payload.get("status") != "active":
        return None

    expires_on = payload.get("expires_on")
    if expires_on and float(expires_on) < datetime.now(UTC).timestamp():
        return None

    issued = payload.get("issued")
    return Certificate(
        title=(payload.get("title") or "").strip(),
        issued=datetime.fromtimestamp(float(issued), UTC) if issued else None,
        # The school's own public link to the certificate, so the claim on the
        # profile can be checked by whoever reads it.
        url=payload.get("short_url") or payload.get("external_url"),
    )


async def _certificates(account_id: str) -> list[Certificate]:
    """Valid certificates for this account, newest first."""
    payload = await _get("certificates", {"user_id": account_id})
    found = [_certificate_from(item) for item in payload.get("data") or []]
    valid = [c for c in found if c and c.title]
    return sorted(valid, key=lambda c: c.issued or datetime.min.replace(tzinfo=UTC), reverse=True)


async def _progress(account_id: str, course_id: str) -> dict:
    """How far someone got in one course. Empty when it cannot be read."""
    try:
        return await _get(f"users/{account_id}/courses/{course_id}/progress")
    except (httpx.RequestError, httpx.HTTPStatusError, LearnWorldsUnavailable):
        # One unreadable course should not cost the whole section.
        return {}


async def _enrolled(account_id: str) -> tuple[list[Course], int | None]:
    """Courses and time spent, in one pass over the enrolments.

    Progress is one call per course, so this is capped: a profile shows a
    handful of courses, and the rest only moved the counter that
    ``get_learning_summary`` already has.
    """
    payload = await _get(f"users/{account_id}/courses")
    enrolments = (payload.get("data") or [])[:_MAX_COURSES_DETAILED]

    courses_raw = [(e.get("course") or {}) for e in enrolments]
    progresses = await asyncio.gather(
        *(_progress(account_id, c.get("id", "")) for c in courses_raw if c.get("id"))
    )

    courses: list[Course] = []
    seconds = 0
    for course, progress in zip(courses_raw, progresses, strict=False):
        title = (course.get("title") or "").strip()
        if title:
            courses.append(
                Course(
                    title=title,
                    status=progress.get("status") or "not_started",
                    progress_rate=int(progress.get("progress_rate") or 0),
                )
            )
        seconds += int(progress.get("time_on_course") or 0)

    # Finished first, then by how far along: a profile leads with achievements.
    courses.sort(key=lambda c: (c.status != "completed", -c.progress_rate))
    hours = seconds // 3600 or None
    return courses, hours


async def _catalogue_size() -> int | None:
    """How many courses the school offers.

    The same number for everyone, so it is cached under its own key and shared
    across profiles rather than fetched per visitor.
    """
    key = "learnworlds_catalogue"
    cached = get_cached(key)
    if cached is not None:
        return cached

    try:
        total = await _count("courses")
    except (httpx.RequestError, httpx.HTTPStatusError, LearnWorldsUnavailable) as exc:
        logger.warning("Could not read the LearnWorlds catalogue: %s", exc)
        return None

    set_cached(key, total, _COURSES_TTL)
    return total


async def get_learning_summary(hanko_user_id: str) -> LearningSummary | None:
    """Courses and certificates for this person, or None when unknown.

    None covers every "nothing to show" case — not configured, no LMS account,
    LearnWorlds down — on purpose: a profile that cannot prove someone has
    courses should leave the section out rather than claim zero.
    """
    if not _is_configured():
        return None

    account_id = await _resolve_account_id(hanko_user_id)
    if not account_id:
        return None

    key = f"learnworlds_learning_{account_id}"
    cached = get_cached(key)
    if cached is not None:
        return cached

    try:
        (courses, hours), certificates, catalogue, total = await asyncio.gather(
            _enrolled(account_id),
            _certificates(account_id),
            _catalogue_size(),
            _count(f"users/{account_id}/courses"),
        )
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.warning("LearnWorlds did not answer for %s: %s", account_id, exc)
        return None
    except LearnWorldsUnavailable as exc:
        logger.warning("LearnWorlds rejected the request for %s: %s", account_id, exc)
        return None

    summary = LearningSummary(courses=courses, certificates=certificates, catalogue=catalogue)
    set_cached(key, summary, _COURSES_TTL)
    return summary

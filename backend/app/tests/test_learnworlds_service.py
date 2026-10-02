"""How the LearnWorlds payloads become what a profile shows.

The API is stubbed here: what matters is the shaping — which courses lead, what
counts as a subject, and when a number is better left out.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services import learnworlds_service as lw


def _course(title, course_id, categories=None):
    return {"course": {"id": course_id, "title": title, "categories": categories or []}}


@pytest.fixture
def api():
    """Stub the two calls `_enrolled` makes: the listing and each progress."""
    with patch.object(lw, "_get", new=AsyncMock()) as mock:
        yield mock


@pytest.mark.asyncio
async def test_finished_courses_come_first(api):
    """A profile leads with what someone achieved, not what they started."""

    async def answer(path, params=None):
        if path.endswith("/courses"):
            return {"data": [_course("Started", "a"), _course("Finished", "b")]}
        if path.endswith("a/progress"):
            return {"status": "in_progress", "progress_rate": 40}
        return {"status": "completed", "progress_rate": 100}

    api.side_effect = answer

    courses, _ = await lw._enrolled("user-1")

    assert [c.title for c in courses] == ["Finished", "Started"]
    assert courses[0].status == "completed"


@pytest.mark.asyncio
async def test_hours_are_omitted_below_one(api):
    """ "0 hours" reads as a judgement; no number reads as nothing."""

    async def answer(path, params=None):
        if path.endswith("/courses"):
            return {"data": [_course("One", "a")]}
        return {"status": "in_progress", "progress_rate": 10, "time_on_course": 600}

    api.side_effect = answer

    _, hours = await lw._enrolled("user-1")

    assert hours is None


@pytest.mark.asyncio
async def test_one_unreadable_course_does_not_sink_the_rest(api):
    """The LMS failing on a single course should cost that course, not the page."""

    async def answer(path, params=None):
        if path.endswith("/courses"):
            return {"data": [_course("One", "a"), _course("Two", "b")]}
        if path.endswith("a/progress"):
            raise lw.LearnWorldsUnavailable("boom")
        return {"status": "completed", "progress_rate": 100}

    api.side_effect = answer

    courses, _ = await lw._enrolled("user-1")

    assert {c.title for c in courses} == {"One", "Two"}
    # The one that failed keeps the safe default rather than a made-up number.
    assert next(c for c in courses if c.title == "One").progress_rate == 0


@pytest.mark.asyncio
async def test_revoked_certificates_are_left_out():
    """Showing a revoked certificate as earned would be worse than showing none."""
    valid = lw._certificate_from({"title": "Mapping", "status": "active", "issued": 1790954019})
    revoked = lw._certificate_from({"title": "Mapping", "status": "revoked"})

    assert valid and valid.title == "Mapping"
    assert revoked is None

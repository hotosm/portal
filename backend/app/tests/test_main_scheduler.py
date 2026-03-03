"""Unit tests for homepage map scheduler task lifecycle and interval behavior."""

import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.main import app as fastapi_app
from app.main import get_homepage_map_sync_interval_seconds, homepage_map_sync_loop, lifespan


@pytest.mark.asyncio
async def test_homepage_map_sync_interval_supports_6_and_7_hours(monkeypatch):
    """Scheduler interval is computed from settings in hours."""
    monkeypatch.setattr("app.main.settings.homepage_map_sync_interval_hours", 6)
    assert get_homepage_map_sync_interval_seconds() == 6 * 60 * 60

    monkeypatch.setattr("app.main.settings.homepage_map_sync_interval_hours", 7)
    assert get_homepage_map_sync_interval_seconds() == 7 * 60 * 60


@pytest.mark.asyncio
async def test_homepage_map_sync_loop_sleeps_for_configured_interval(monkeypatch):
    """Loop waits the configured interval between sync runs."""

    class _FakeSessionContext:
        async def __aenter__(self):
            return object()

        async def __aexit__(self, exc_type, exc, tb):
            return False

    sleep_calls: list[int] = []

    async def _fake_sleep(seconds: int):
        sleep_calls.append(seconds)
        raise asyncio.CancelledError()

    sync_mock = AsyncMock(return_value={})

    monkeypatch.setattr("app.main.AsyncSessionLocal", lambda: _FakeSessionContext())
    monkeypatch.setattr("app.services.map_projects_service.sync_from_sources", sync_mock)
    monkeypatch.setattr("app.main.settings.homepage_map_sync_interval_hours", 7)
    monkeypatch.setattr("app.main.asyncio.sleep", _fake_sleep)

    with pytest.raises(asyncio.CancelledError):
        await homepage_map_sync_loop()

    sync_mock.assert_awaited_once()
    assert sleep_calls == [7 * 60 * 60]


@pytest.mark.asyncio
async def test_lifespan_starts_and_cancels_homepage_sync_task(monkeypatch):
    """Lifespan startup creates scheduler task and shutdown cancels it."""

    async def _fake_preload_cache():
        return None

    async def _waiting_loop():
        await asyncio.Future()

    @asynccontextmanager
    async def _fake_lifespan_context():
        yield

    monkeypatch.setattr("app.main.preload_cache", _fake_preload_cache)
    monkeypatch.setattr("app.main.homepage_map_sync_loop", _waiting_loop)
    monkeypatch.setattr("app.main.AuthConfig.from_env", lambda: MagicMock())
    monkeypatch.setattr("app.main.init_auth", lambda x: None)

    async with lifespan(fastapi_app):
        task = getattr(fastapi_app.state, "homepage_map_sync_task", None)
        assert task is not None
        assert not task.done()

    task_after = getattr(fastapi_app.state, "homepage_map_sync_task", None)
    assert task_after is not None
    assert task_after.cancelled() or task_after.done()

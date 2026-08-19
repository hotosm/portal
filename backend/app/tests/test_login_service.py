"""Tests for the login group-membership client + cache."""

import httpx
import pytest
import respx

from app.core.config import settings
from app.services import login_service


@pytest.fixture
def enable_groups():
    original = settings.login_groups_enabled
    original_url = settings.hanko_api_url
    settings.login_groups_enabled = True
    settings.hanko_api_url = "http://login-test"
    yield
    settings.login_groups_enabled = original
    settings.hanko_api_url = original_url


@pytest.mark.asyncio
async def test_disabled_returns_empty():
    # Feature flag off (default) => no HTTP call, empty list.
    groups = await login_service.get_user_groups("u1", "cookie")
    assert groups == []


@pytest.mark.asyncio
@respx.mock
async def test_parses_groups(enable_groups):
    respx.get("http://login-test/api/groups").mock(
        return_value=httpx.Response(
            200,
            json={
                "groups": [
                    {
                        "id": "t1",
                        "type": "team",
                        "slug": "mappers",
                        "name": "Mappers",
                        "role": "owner",
                        "status": "approved",
                    }
                ]
            },
        )
    )
    groups = await login_service.get_user_groups("u-parse", "cookie")
    assert len(groups) == 1
    assert groups[0].id == "t1"
    assert groups[0].role == "owner"


@pytest.mark.asyncio
@respx.mock
async def test_401_returns_empty(enable_groups):
    respx.get("http://login-test/api/groups").mock(
        return_value=httpx.Response(401)
    )
    assert await login_service.get_user_groups("u-401", "cookie") == []


@pytest.mark.asyncio
@respx.mock
async def test_network_error_raises_unavailable(enable_groups):
    respx.get("http://login-test/api/groups").mock(
        side_effect=httpx.ConnectError("boom")
    )
    with pytest.raises(login_service.LoginUnavailable):
        await login_service.get_user_groups("u-err", "cookie")


@pytest.mark.asyncio
@respx.mock
async def test_result_is_cached(enable_groups):
    route = respx.get("http://login-test/api/groups").mock(
        return_value=httpx.Response(200, json={"groups": []})
    )
    await login_service.get_user_groups("u-cache", "cookie")
    await login_service.get_user_groups("u-cache", "cookie")
    # Second call served from cache => only one HTTP request.
    assert route.call_count == 1

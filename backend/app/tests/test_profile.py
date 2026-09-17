"""Tests for the profile endpoints: GET/PATCH /api/profile/me, GET /api/public/profile/{slug}."""

from unittest.mock import AsyncMock, patch

import pytest

from app.services import login_service


def _account_profile(**overrides):
    defaults = {
        "hanko_user_id": "user-a-id",
        "first_name": "Ada",
        "last_name": "Lovelace",
        "picture_url": None,
        "slug": "ada",
        "is_public": True,
        "osm_username": None,
        "osm_avatar_url": None,
    }
    defaults.update(overrides)
    return login_service.AccountProfile(**defaults)


def _public_account_profile(**overrides):
    defaults = {
        "hanko_user_id": "user-a-id",
        "slug": "ada",
        "first_name": "Ada",
        "last_name": "Lovelace",
        "picture_url": None,
    }
    defaults.update(overrides)
    return login_service.PublicAccountProfile(**defaults)


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client):
    response = await client.get("/api/profile/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_merges_account_and_portal_fields(auth_client):
    c, _user = auth_client
    with patch(
        "app.services.profile_service.login_service.get_account_profile",
        new=AsyncMock(return_value=_account_profile()),
    ):
        response = await c.get("/api/profile/me")
    assert response.status_code == 200
    body = response.json()
    assert body["hanko_user_id"] == "user-a-id"
    assert body["slug"] == "ada"
    assert body["portal"]["show_organizations"] is False


@pytest.mark.asyncio
async def test_get_me_upstream_unavailable(auth_client):
    c, _user = auth_client
    with patch(
        "app.services.profile_service.login_service.get_account_profile",
        new=AsyncMock(side_effect=login_service.LoginUnavailable("down")),
    ):
        response = await c.get("/api/profile/me")
    assert response.status_code == 502


@pytest.mark.asyncio
async def test_patch_me_partial_update_never_calls_login(auth_client):
    c, _user = auth_client
    login_mock = AsyncMock(side_effect=AssertionError("PATCH must never call login"))
    with patch("app.services.login_service.get_account_profile", new=login_mock), patch(
        "app.services.login_service.get_public_account_profile", new=login_mock
    ):
        response = await c.patch("/api/profile/me", json={"bio": "Hello world"})
    assert response.status_code == 200
    body = response.json()
    assert body["bio"] == "Hello world"
    assert body["show_organizations"] is False
    login_mock.assert_not_called()


@pytest.mark.asyncio
async def test_patch_me_invalid_linkedin_url(auth_client):
    c, _user = auth_client
    response = await c.patch(
        "/api/profile/me", json={"linkedin_url": "https://not-linkedin.com/in/ada"}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_patch_me_invalid_contact_email(auth_client):
    c, _user = auth_client
    response = await c.patch("/api/profile/me", json={"contact_email": "not-an-email"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_public_profile_404_when_login_reports_not_public(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=None),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_public_profile_omits_organizations_when_not_shown(client):
    groups_mock = AsyncMock(side_effect=AssertionError("must not call groups sub-endpoint"))
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch("app.services.profile_service.login_service.get_public_user_groups_by_slug", new=groups_mock):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 200
    body = response.json()
    assert body["organizations"] is None
    groups_mock.assert_not_called()


@pytest.mark.asyncio
async def test_public_profile_includes_organizations_when_shown(auth_client):
    c, user = auth_client
    with patch(
        "app.services.profile_service.login_service.get_account_profile",
        new=AsyncMock(return_value=_account_profile(hanko_user_id=user.id, slug="ada")),
    ):
        await c.patch("/api/profile/me", json={"show_organizations": True})

    public_group = login_service.PublicGroup(
        type="organization",
        name="HOT",
        slug="hot",
        description=None,
        website=None,
        avatar_url=None,
        banner_url=None,
        members_count=3,
    )
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile(hanko_user_id=user.id)),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=AsyncMock(return_value=[public_group]),
    ):
        # The public route requires no auth; reusing the authenticated client
        # here (same pattern as test_plans.py's test_shared_endpoint_public_plan)
        # exercises it identically to an anonymous caller.
        response = await c.get("/api/public/profile/ada")
    assert response.status_code == 200
    body = response.json()
    assert body["organizations"] == [
        {
            "type": "organization",
            "name": "HOT",
            "slug": "hot",
            "description": None,
            "website": None,
            "avatar_url": None,
            "banner_url": None,
            "members_count": 3,
        }
    ]


@pytest.mark.asyncio
async def test_public_profile_upstream_unavailable(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(side_effect=login_service.LoginUnavailable("down")),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 502

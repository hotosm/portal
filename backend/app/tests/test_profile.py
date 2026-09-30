"""Tests for the profile endpoints: GET/PATCH /api/profile/me, GET /api/public/profile/{slug}."""

from unittest.mock import AsyncMock, patch

import pytest

from app.db.models.profile import PortalProfile
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


def _public_group(**overrides):
    defaults = {
        "type": "organization",
        "name": "HOT",
        "slug": "hot",
        "description": None,
        "website": None,
        "avatar_url": None,
        "banner_url": None,
        "members_count": 3,
    }
    defaults.update(overrides)
    return login_service.PublicGroup(**defaults)


def _groups_by_type(orgs, teams):
    """Mock for get_public_user_groups_by_slug that answers per group type."""

    async def _fetch(slug, group_type="org"):
        return orgs if group_type == "org" else teams

    return AsyncMock(side_effect=_fetch)


@pytest.mark.asyncio
async def test_public_profile_includes_organizations_from_login(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=_groups_by_type([_public_group()], []),
    ):
        response = await client.get("/api/public/profile/ada")
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
async def test_public_profile_includes_teams_from_login(client):
    public_team = _public_group(
        type="team",
        name="Mappers",
        slug="mappers",
        avatar_url="/api/groups/1/avatar?v=1",
        members_count=5,
    )
    groups_mock = _groups_by_type([], [public_team])
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=groups_mock,
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 200
    body = response.json()
    assert body["organizations"] == []
    assert body["teams"] == [
        {
            "type": "team",
            "name": "Mappers",
            "slug": "mappers",
            "description": None,
            "website": None,
            "avatar_url": "/api/groups/1/avatar?v=1",
            "banner_url": None,
            "members_count": 5,
        }
    ]
    requested_types = sorted(call.args[1] for call in groups_mock.await_args_list)
    assert requested_types == ["org", "team"]


@pytest.mark.asyncio
async def test_public_profile_empty_groups_when_login_has_none(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=_groups_by_type([], []),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 200
    body = response.json()
    assert body["organizations"] == []
    assert body["teams"] == []


@pytest.mark.asyncio
async def test_public_profile_hides_contact_but_flags_it(client, test_db_session):
    test_db_session.add(
        PortalProfile(hanko_user_id="user-a-id", contact_email="ada@example.com")
    )
    await test_db_session.flush()
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=_groups_by_type([], []),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 200
    body = response.json()
    assert body["has_contact"] is True
    for field in ("contact_email", "phone", "linkedin_url"):
        assert field not in body


@pytest.mark.asyncio
async def test_public_profile_has_contact_false_without_contact(client, test_db_session):
    test_db_session.add(PortalProfile(hanko_user_id="user-a-id", bio="Hi"))
    await test_db_session.flush()
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=_groups_by_type([], []),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 200
    assert response.json()["has_contact"] is False


@pytest.mark.asyncio
async def test_public_profile_has_contact_false_without_portal_row(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=_groups_by_type([], []),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 200
    body = response.json()
    assert body["has_contact"] is False


@pytest.mark.asyncio
async def test_public_profile_upstream_unavailable_on_groups(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ), patch(
        "app.services.profile_service.login_service.get_public_user_groups_by_slug",
        new=AsyncMock(side_effect=login_service.LoginUnavailable("down")),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 502


@pytest.mark.asyncio
async def test_public_profile_upstream_unavailable(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(side_effect=login_service.LoginUnavailable("down")),
    ):
        response = await client.get("/api/public/profile/ada")
    assert response.status_code == 502


@pytest.mark.asyncio
async def test_public_contact_returns_contact_details(client, test_db_session):
    test_db_session.add(
        PortalProfile(
            hanko_user_id="user-a-id",
            contact_email="ada@example.com",
            phone="+44 20 0000 0000",
            linkedin_url="https://www.linkedin.com/in/ada",
        )
    )
    await test_db_session.flush()
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ):
        response = await client.get("/api/public/profile/ada/contact")
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.json() == {
        "contact_email": "ada@example.com",
        "phone": "+44 20 0000 0000",
        "linkedin_url": "https://www.linkedin.com/in/ada",
    }


@pytest.mark.asyncio
async def test_public_contact_all_none_without_portal_row(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=_public_account_profile()),
    ):
        response = await client.get("/api/public/profile/ada/contact")
    assert response.status_code == 200
    assert response.json() == {"contact_email": None, "phone": None, "linkedin_url": None}


@pytest.mark.asyncio
async def test_public_contact_404_when_not_public_or_missing(client, test_db_session):
    test_db_session.add(PortalProfile(hanko_user_id="user-a-id", contact_email="ada@example.com"))
    await test_db_session.flush()
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(return_value=None),
    ):
        response = await client.get("/api/public/profile/ada/contact")
    assert response.status_code == 404
    assert "ada@example.com" not in response.text


@pytest.mark.asyncio
async def test_public_contact_upstream_unavailable(client):
    with patch(
        "app.services.profile_service.login_service.get_public_account_profile",
        new=AsyncMock(side_effect=login_service.LoginUnavailable("down")),
    ):
        response = await client.get("/api/public/profile/ada/contact")
    assert response.status_code == 502
    assert response.json()["detail"] == "upstream_unavailable"

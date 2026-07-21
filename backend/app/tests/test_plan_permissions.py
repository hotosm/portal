"""Integration tests for team/organization plan permissions.

Login's group membership is mocked here (patching login_service.get_user_groups)
so these tests focus on portal's authorization behavior.
"""

from datetime import UTC, datetime
from unittest.mock import patch

import pytest
import pytest_asyncio
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi.dependencies import (
    get_current_user,
    get_current_user_optional,
)
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.services import login_service


def _user(uid: str) -> HankoUser:
    now = datetime.now(UTC)
    return HankoUser(
        id=uid,
        email=f"{uid}@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


def _group(gid="t1", gtype="team"):
    return login_service.UserGroup(
        id=gid, type=gtype, slug=gid, name=gid, role="member", status="approved"
    )


@pytest_asyncio.fixture
async def group_ctx(test_db_session):
    """Client whose user is switchable, with login memberships mocked.

    Yields (client, user_cell, memberships) where memberships maps
    user_id -> list[UserGroup]. Set ``memberships[uid] = [...]`` to grant.
    Set ``memberships["__down__"] = True`` to simulate login being down.
    """
    user_cell: list = [None]
    memberships: dict = {}

    async def override_get_db():
        yield test_db_session

    async def override_cu():
        return user_cell[0]

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_cu
    app.dependency_overrides[get_current_user_optional] = override_cu

    async def fake_groups(user_id, hanko_cookie, *, force_refresh=False):
        if memberships.get("__down__"):
            raise login_service.LoginUnavailable("down")
        return memberships.get(user_id, [])

    with patch("app.services.login_service.get_user_groups", new=fake_groups):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            yield c, user_cell, memberships

    app.dependency_overrides.clear()


async def _create_group_plan(client, edit_scope="group", visibility="group"):
    return await client.post(
        "/api/plans",
        json={
            "name": "Team Plan",
            "group_type": "team",
            "group_id": "t1",
            "visibility": visibility,
            "edit_scope": edit_scope,
            "projects": [],
        },
    )


@pytest.mark.asyncio
async def test_member_can_view_and_edit_group_plan(group_ctx):
    client, user_cell, memberships = group_ctx
    owner, member = _user("owner"), _user("member")
    memberships["owner"] = [_group()]
    memberships["member"] = [_group()]

    user_cell[0] = owner
    resp = await _create_group_plan(client)
    assert resp.status_code == 201, resp.text
    plan_id = resp.json()["id"]
    assert resp.json()["visibility"] == "group"

    # The member sees it in their list and can edit it.
    user_cell[0] = member
    listed = await client.get("/api/plans")
    assert any(p["id"] == plan_id for p in listed.json())

    resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 200
    assert resp.json()["can_edit"] is True
    assert resp.json()["is_owner"] is False

    resp = await client.patch(
        f"/api/plans/{plan_id}", json={"description": "edited by member"}
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_non_member_cannot_see_group_plan(group_ctx):
    client, user_cell, memberships = group_ctx
    memberships["owner"] = [_group()]

    user_cell[0] = _user("owner")
    plan_id = (await _create_group_plan(client)).json()["id"]

    user_cell[0] = _user("stranger")  # no memberships
    assert (await client.get(f"/api/plans/{plan_id}")).status_code == 404
    assert (await client.get("/api/plans")).json() == []


@pytest.mark.asyncio
async def test_edit_scope_owner_blocks_member_edit(group_ctx):
    client, user_cell, memberships = group_ctx
    memberships["owner"] = [_group()]
    memberships["member"] = [_group()]

    user_cell[0] = _user("owner")
    plan_id = (await _create_group_plan(client, edit_scope="owner")).json()["id"]

    user_cell[0] = _user("member")
    # Can view (group visibility) but not edit (edit_scope=owner).
    assert (await client.get(f"/api/plans/{plan_id}")).json()["can_edit"] is False
    resp = await client.patch(f"/api/plans/{plan_id}", json={"description": "x"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_cannot_assign_to_group_not_member_of(group_ctx):
    client, user_cell, memberships = group_ctx
    user_cell[0] = _user("owner")  # not a member of t1
    resp = await _create_group_plan(client)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_owner_works_when_login_down(group_ctx):
    client, user_cell, memberships = group_ctx
    memberships["owner"] = [_group()]

    user_cell[0] = _user("owner")
    plan_id = (await _create_group_plan(client)).json()["id"]

    # Login goes down: the owner can still view and edit (local check).
    memberships["__down__"] = True
    resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 200
    resp = await client.patch(f"/api/plans/{plan_id}", json={"description": "y"})
    assert resp.status_code == 200

    # ...but a member loses access (fail-closed).
    memberships["member"] = [_group()]
    user_cell[0] = _user("member")
    assert (await client.get(f"/api/plans/{plan_id}")).status_code == 404


@pytest.mark.asyncio
async def test_public_group_plan_served_by_shared(group_ctx):
    client, user_cell, memberships = group_ctx
    memberships["owner"] = [_group()]

    user_cell[0] = _user("owner")
    plan_id = (
        await _create_group_plan(client, visibility="public")
    ).json()["id"]

    # Anonymous access via the shared endpoint (no auth dependency).
    app.dependency_overrides.pop(get_current_user_optional, None)
    resp = await client.get(f"/api/plans/shared/{plan_id}")
    assert resp.status_code == 200
    assert resp.json()["visibility"] == "public"

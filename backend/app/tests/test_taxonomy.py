"""Tests for Groups and Tags: open-text taxonomies on plan projects/tasks.

Covers CRUD, owner isolation, team/org sharing, and assigning groups/tags to
a plan_project (including the cascade-delete fallback to the virtual "All").
"""

from collections.abc import AsyncGenerator
from datetime import UTC, datetime

import pytest
import pytest_asyncio
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi.dependencies import get_current_user, get_current_user_optional
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.services import login_service


def make_user(user_id: str, email: str = "u@example.com") -> HankoUser:
    now = datetime.now(UTC)
    return HankoUser(
        id=user_id,
        email=email,
        email_verified=True,
        created_at=now,
        updated_at=now,
        username=email.split("@")[0],
    )


def make_group(gid: str = "t1", gtype: str = "team"):
    return login_service.UserGroup(
        id=gid, type=gtype, slug=gid, name=gid, role="member", status="approved"
    )


@pytest_asyncio.fixture
async def auth_client(test_db_session) -> AsyncGenerator[tuple[AsyncClient, HankoUser], None]:
    """Client authenticated as a fixed test user (user A), no team memberships."""
    user = make_user("user-a-id", "a@example.com")

    async def override_get_db():
        yield test_db_session

    async def override_current_user():
        return user

    async def override_current_user_optional():
        return user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    app.dependency_overrides[get_current_user_optional] = override_current_user_optional

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c, user

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def two_auth_clients(test_db_session):
    """Single client whose current user + login memberships are switchable.

    Yields (client, user_cell, memberships). Set user_cell[0] before each
    request to control auth; set memberships[uid] = [UserGroup, ...] to grant
    team/org membership (mocked, see test_plan_permissions.py for the pattern).
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

    async def fake_get_user_groups(user_id, hanko_cookie):
        return memberships.get(user_id, [])

    from unittest.mock import patch

    with patch("app.services.login_service.get_user_groups", side_effect=fake_get_user_groups):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            yield c, user_cell, memberships

    app.dependency_overrides.clear()


# ─────────────────────────────── Groups CRUD ──────────────────────────────────


@pytest.mark.asyncio
async def test_create_list_update_delete_group(auth_client):
    client, _ = auth_client

    resp = await client.post(
        "/api/project-groups", json={"name": "Imagery work", "description": "Drone + OAM"}
    )
    assert resp.status_code == 201, resp.text
    group = resp.json()
    assert group["name"] == "Imagery work"
    assert group["description"] == "Drone + OAM"
    group_id = group["id"]

    resp = await client.get("/api/project-groups")
    assert resp.status_code == 200
    groups = resp.json()
    assert len(groups) == 1
    assert groups[0]["id"] == group_id

    resp = await client.patch(f"/api/project-groups/{group_id}", json={"name": "Renamed"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Renamed"

    resp = await client.delete(f"/api/project-groups/{group_id}")
    assert resp.status_code == 204

    resp = await client.get("/api/project-groups")
    assert resp.json() == []


@pytest.mark.asyncio
async def test_duplicate_group_name_same_scope_rejected(auth_client):
    client, _ = auth_client
    payload = {"name": "Duplicate"}
    resp = await client.post("/api/project-groups", json=payload)
    assert resp.status_code == 201

    resp = await client.post("/api/project-groups", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_group_owner_isolation(two_auth_clients):
    client, user_cell, _ = two_auth_clients
    user_a = make_user("user-a-id", "a@example.com")
    user_b = make_user("user-b-id", "b@example.com")

    user_cell[0] = user_a
    resp = await client.post("/api/project-groups", json={"name": "A's group"})
    assert resp.status_code == 201
    group_id = resp.json()["id"]

    user_cell[0] = user_b
    resp = await client.get("/api/project-groups")
    assert resp.json() == []

    resp = await client.patch(f"/api/project-groups/{group_id}", json={"name": "Hijacked"})
    assert resp.status_code == 404

    resp = await client.delete(f"/api/project-groups/{group_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_team_group_shared_with_members_not_others(two_auth_clients):
    client, user_cell, memberships = two_auth_clients
    user_a = make_user("user-a-id", "a@example.com")
    user_b = make_user("user-b-id", "b@example.com")
    user_c = make_user("user-c-id", "c@example.com")
    memberships["user-a-id"] = [make_group("team-1", "team")]
    memberships["user-b-id"] = [make_group("team-1", "team")]

    user_cell[0] = user_a
    resp = await client.post(
        "/api/project-groups",
        json={"name": "Team group", "group_type": "team", "group_id": "team-1"},
    )
    assert resp.status_code == 201, resp.text
    group_id = resp.json()["id"]

    # Fellow team member can see and edit it.
    user_cell[0] = user_b
    resp = await client.get("/api/project-groups")
    assert [g["id"] for g in resp.json()] == [group_id]
    resp = await client.patch(f"/api/project-groups/{group_id}", json={"name": "Renamed by B"})
    assert resp.status_code == 200

    # A non-member can't.
    user_cell[0] = user_c
    resp = await client.get("/api/project-groups")
    assert resp.json() == []
    resp = await client.delete(f"/api/project-groups/{group_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_group_for_group_not_a_member_of_forbidden(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/project-groups",
        json={"name": "Not mine", "group_type": "team", "group_id": "some-other-team"},
    )
    assert resp.status_code == 403


# ─────────────────────────────────── Tags CRUD ────────────────────────────────


@pytest.mark.asyncio
async def test_create_list_update_delete_tag(auth_client):
    client, _ = auth_client

    resp = await client.post("/api/tags", json={"name": "urgent"})
    assert resp.status_code == 201, resp.text
    tag_id = resp.json()["id"]

    resp = await client.get("/api/tags")
    assert [t["id"] for t in resp.json()] == [tag_id]

    resp = await client.patch(f"/api/tags/{tag_id}", json={"name": "not-urgent"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "not-urgent"

    resp = await client.delete(f"/api/tags/{tag_id}")
    assert resp.status_code == 204
    resp = await client.get("/api/tags")
    assert resp.json() == []


# ───────────────────────── Assigning to a plan project ────────────────────────


@pytest_asyncio.fixture
async def plan_with_project(auth_client):
    """An auth_client with one plan_project already created; returns ids."""
    client, user = auth_client
    resp = await client.post(
        "/api/plans",
        json={"name": "My plan", "projects": [{"app": "tasking-manager", "project_id": "1"}]},
    )
    assert resp.status_code == 201, resp.text
    created = resp.json()
    return client, user, created["id"], created["projects"][0]["id"]


@pytest.mark.asyncio
async def test_assign_and_unassign_groups_on_plan_project(plan_with_project):
    client, _, plan_id, plan_project_id = plan_with_project

    resp = await client.post("/api/project-groups", json={"name": "Imagery"})
    group_id = resp.json()["id"]

    resp = await client.patch(
        f"/api/plans/{plan_id}/projects/{plan_project_id}/groups",
        json={"group_ids": [group_id]},
    )
    assert resp.status_code == 204, resp.text

    resp = await client.get(f"/api/plans/{plan_id}")
    project = resp.json()["projects"][0]
    assert [g["id"] for g in project["groups"]] == [group_id]

    # Deleting the group cascades: the project falls back to the virtual "All".
    resp = await client.delete(f"/api/project-groups/{group_id}")
    assert resp.status_code == 204

    resp = await client.get(f"/api/plans/{plan_id}")
    project = resp.json()["projects"][0]
    assert project["groups"] == []


@pytest.mark.asyncio
async def test_assign_tags_on_plan_project(plan_with_project):
    client, _, plan_id, plan_project_id = plan_with_project

    resp = await client.post("/api/tags", json={"name": "priority"})
    tag_id = resp.json()["id"]

    resp = await client.patch(
        f"/api/plans/{plan_id}/projects/{plan_project_id}/tags",
        json={"tag_ids": [tag_id]},
    )
    assert resp.status_code == 204, resp.text

    resp = await client.get(f"/api/plans/{plan_id}")
    project = resp.json()["projects"][0]
    assert [t["id"] for t in project["tags"]] == [tag_id]


@pytest.mark.asyncio
async def test_assign_unknown_group_id_rejected(plan_with_project):
    client, _, plan_id, plan_project_id = plan_with_project

    resp = await client.patch(
        f"/api/plans/{plan_id}/projects/{plan_project_id}/groups",
        json={"group_ids": ["does-not-exist"]},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_cannot_assign_another_owners_group(two_auth_clients):
    client, user_cell, _ = two_auth_clients
    user_a = make_user("user-a-id", "a@example.com")
    user_b = make_user("user-b-id", "b@example.com")

    user_cell[0] = user_a
    resp = await client.post("/api/project-groups", json={"name": "A's group"})
    group_id = resp.json()["id"]

    user_cell[0] = user_b
    resp = await client.post(
        "/api/plans",
        json={"name": "B's plan", "projects": [{"app": "tasking-manager", "project_id": "1"}]},
    )
    plan = resp.json()
    plan_id, plan_project_id = plan["id"], plan["projects"][0]["id"]

    resp = await client.patch(
        f"/api/plans/{plan_id}/projects/{plan_project_id}/groups",
        json={"group_ids": [group_id]},
    )
    assert resp.status_code == 422

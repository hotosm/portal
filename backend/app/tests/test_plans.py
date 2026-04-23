"""Tests for the Plans feature.

Covers CRUD, user isolation, unique constraint, hydration (200/404/5xx),
orphan flow, parallelism, tag lookup, and listing enrichment on one app.
"""

import asyncio
from collections.abc import AsyncGenerator
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import httpx
import pytest
import pytest_asyncio
import respx
from httpx import ASGITransport, AsyncClient

from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi.dependencies import (
    get_current_user,
    get_current_user_optional,
)

from app.core.config import settings
from app.core.database import get_db
from app.main import app
from app.services import plans_service
from app.services.exceptions import UpstreamUnavailable


def make_user(user_id: str, email: str = "u@example.com") -> HankoUser:
    now = datetime.now(timezone.utc)
    return HankoUser(
        id=user_id,
        email=email,
        email_verified=True,
        created_at=now,
        updated_at=now,
        username=email.split("@")[0],
    )


@pytest_asyncio.fixture
async def auth_client(test_db_session) -> AsyncGenerator[tuple[AsyncClient, HankoUser], None]:
    """Client authenticated as a fixed test user (user A)."""
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
    """Single client whose current user can be switched between requests.

    Yields (client, user_cell) where user_cell is a 1-element list.
    Set user_cell[0] = some_user before each request to control auth.
    """
    user_cell: list = [None]

    async def override_get_db():
        yield test_db_session

    async def override_current_user():
        return user_cell[0]

    async def override_current_user_optional():
        return user_cell[0]

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    app.dependency_overrides[get_current_user_optional] = override_current_user_optional

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c, user_cell

    app.dependency_overrides.clear()


# ─────────────────────────────── CRUD ────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_and_list_plan(auth_client):
    client, _ = auth_client
    payload = {
        "name": "My plan",
        "description": "Some description",
        "projects": [
            {"app": "tasking-manager", "project_id": "123"},
            {"app": "fair", "project_id": "7", "data": {"note": "hi"}},
        ],
    }
    resp = await client.post("/api/plans", json=payload)
    assert resp.status_code == 201, resp.text
    created = resp.json()
    assert created["name"] == "My plan"
    assert len(created["projects"]) == 2
    plan_id = created["id"]

    resp = await client.get("/api/plans")
    assert resp.status_code == 200
    plans = resp.json()
    assert len(plans) == 1
    assert plans[0]["id"] == plan_id
    assert {p["app"] for p in plans[0]["projects"]} == {"tasking-manager", "fair"}


@pytest.mark.asyncio
async def test_patch_plan_replaces_projects(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [{"app": "tasking-manager", "project_id": "1"}],
        },
    )
    plan_id = resp.json()["id"]

    resp = await client.patch(
        f"/api/plans/{plan_id}",
        json={
            "name": "P renamed",
            "projects": [
                {"app": "fair", "project_id": "42"},
                {"app": "field-tm", "project_id": "9"},
            ],
        },
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["name"] == "P renamed"
    assert {(p["app"], p["project_id"]) for p in body["projects"]} == {
        ("fair", "42"),
        ("field-tm", "9"),
    }


@pytest.mark.asyncio
async def test_patch_name_only_keeps_projects(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [{"app": "tasking-manager", "project_id": "1"}],
        },
    )
    plan_id = resp.json()["id"]

    resp = await client.patch(f"/api/plans/{plan_id}", json={"name": "renamed"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "renamed"
    assert len(body["projects"]) == 1


@pytest.mark.asyncio
async def test_delete_plan_cascades(auth_client, test_db_session):
    from sqlalchemy import select
    from app.db.models.plan import PlanProject

    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [{"app": "tasking-manager", "project_id": "1"}],
        },
    )
    plan_id = resp.json()["id"]

    resp = await client.delete(f"/api/plans/{plan_id}")
    assert resp.status_code == 204

    rows = (await test_db_session.execute(select(PlanProject))).scalars().all()
    assert rows == []


@pytest.mark.asyncio
async def test_unique_constraint_duplicate_in_payload(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {"app": "tasking-manager", "project_id": "1"},
                {"app": "tasking-manager", "project_id": "1"},
            ],
        },
    )
    assert resp.status_code == 422


# ───────────────────────── User isolation ────────────────────────────────────


@pytest.mark.asyncio
async def test_user_isolation(two_auth_clients):
    client, user_cell = two_auth_clients
    user_a = make_user("user-a-id", "a@example.com")
    user_b = make_user("user-b-id", "b@example.com")

    user_cell[0] = user_a
    resp = await client.post("/api/plans", json={"name": "A's plan", "projects": []})
    assert resp.status_code == 201
    plan_id = resp.json()["id"]

    user_cell[0] = user_b
    resp = await client.get("/api/plans")
    assert resp.json() == []

    resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 404

    resp = await client.patch(f"/api/plans/{plan_id}", json={"name": "hacked"})
    assert resp.status_code == 404

    resp = await client.delete(f"/api/plans/{plan_id}")
    assert resp.status_code == 404


# ───────────────────────── Hydration ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_hydrate_plan_all_ok(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {"app": "tasking-manager", "project_id": "1"},
                {"app": "fair", "project_id": "2"},
                {"app": "field-tm", "project_id": "3"},
            ],
        },
    )
    plan_id = resp.json()["id"]

    fetchers = {
        "tasking-manager": AsyncMock(return_value={"organisationName": "org1"}),
        "fair": AsyncMock(return_value={"name": "model2"}),
        "field-tm": AsyncMock(return_value={"name": "proj3"}),
        "drone-tasking-manager": AsyncMock(return_value=None),
        "open-aerial-map": AsyncMock(return_value=None),
        "export-tool": AsyncMock(return_value=None),
        "umap": AsyncMock(return_value=None),
    }
    with patch.dict(plans_service.APP_FETCHERS, fetchers):
        resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 200
    by_app = {p["app"]: p for p in resp.json()["projects"]}
    assert by_app["tasking-manager"]["upstream"] == {"organisationName": "org1"}
    assert by_app["tasking-manager"]["error"] is None
    assert by_app["fair"]["upstream"] == {"name": "model2"}
    assert by_app["field-tm"]["upstream"] == {"name": "proj3"}


@pytest.mark.asyncio
async def test_hydrate_plan_orphan_item(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {"app": "tasking-manager", "project_id": "1"},
                {"app": "fair", "project_id": "404"},
            ],
        },
    )
    plan_id = resp.json()["id"]

    fetchers = {
        "tasking-manager": AsyncMock(return_value={"ok": True}),
        "fair": AsyncMock(return_value=None),
        "field-tm": AsyncMock(return_value=None),
        "drone-tasking-manager": AsyncMock(return_value=None),
        "open-aerial-map": AsyncMock(return_value=None),
        "export-tool": AsyncMock(return_value=None),
        "umap": AsyncMock(return_value=None),
    }
    with patch.dict(plans_service.APP_FETCHERS, fetchers):
        resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 200
    by_app = {p["app"]: p for p in resp.json()["projects"]}
    assert by_app["tasking-manager"]["error"] is None
    assert by_app["fair"]["upstream"] is None
    assert by_app["fair"]["error"] == "not_found"


@pytest.mark.asyncio
async def test_hydrate_plan_upstream_unavailable(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {"app": "tasking-manager", "project_id": "1"},
                {"app": "fair", "project_id": "2"},
            ],
        },
    )
    plan_id = resp.json()["id"]

    async def broken(_id):
        raise UpstreamUnavailable("boom")

    fetchers = {
        "tasking-manager": AsyncMock(return_value={"ok": True}),
        "fair": broken,
        "field-tm": AsyncMock(return_value=None),
        "drone-tasking-manager": AsyncMock(return_value=None),
        "open-aerial-map": AsyncMock(return_value=None),
        "export-tool": AsyncMock(return_value=None),
        "umap": AsyncMock(return_value=None),
    }
    with patch.dict(plans_service.APP_FETCHERS, fetchers):
        resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 200
    by_app = {p["app"]: p for p in resp.json()["projects"]}
    assert by_app["tasking-manager"]["error"] is None
    assert by_app["fair"]["error"] == "upstream_unavailable"


@pytest.mark.asyncio
async def test_orphan_end_to_end_flow(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {"app": "tasking-manager", "project_id": "1"},
                {"app": "fair", "project_id": "gone"},
            ],
        },
    )
    plan_id = resp.json()["id"]

    fetchers = {
        "tasking-manager": AsyncMock(return_value={"ok": True}),
        "fair": AsyncMock(return_value=None),
        "field-tm": AsyncMock(return_value=None),
        "drone-tasking-manager": AsyncMock(return_value=None),
        "open-aerial-map": AsyncMock(return_value=None),
        "export-tool": AsyncMock(return_value=None),
        "umap": AsyncMock(return_value=None),
    }
    with patch.dict(plans_service.APP_FETCHERS, fetchers):
        resp = await client.get(f"/api/plans/{plan_id}")
    assert any(p["error"] == "not_found" for p in resp.json()["projects"])

    # User removes the orphan via PATCH
    resp = await client.patch(
        f"/api/plans/{plan_id}",
        json={"projects": [{"app": "tasking-manager", "project_id": "1"}]},
    )
    assert resp.status_code == 200
    assert len(resp.json()["projects"]) == 1

    with patch.dict(plans_service.APP_FETCHERS, fetchers):
        resp = await client.get(f"/api/plans/{plan_id}")
    assert len(resp.json()["projects"]) == 1
    assert resp.json()["projects"][0]["app"] == "tasking-manager"


@pytest.mark.asyncio
async def test_hydrate_parallelism(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [
                {"app": "tasking-manager", "project_id": "1"},
                {"app": "fair", "project_id": "2"},
                {"app": "field-tm", "project_id": "3"},
            ],
        },
    )
    plan_id = resp.json()["id"]

    async def slow_fetcher(_id):
        await asyncio.sleep(0.2)
        return {"ok": True}

    fetchers = {
        "tasking-manager": slow_fetcher,
        "fair": slow_fetcher,
        "field-tm": slow_fetcher,
        "drone-tasking-manager": AsyncMock(return_value=None),
        "open-aerial-map": AsyncMock(return_value=None),
        "export-tool": AsyncMock(return_value=None),
        "umap": AsyncMock(return_value=None),
    }
    with patch.dict(plans_service.APP_FETCHERS, fetchers):
        loop = asyncio.get_event_loop()
        t0 = loop.time()
        resp = await client.get(f"/api/plans/{plan_id}")
        elapsed = loop.time() - t0
    assert resp.status_code == 200
    # Sequential would be ~0.6s; parallel should be closer to 0.2s.
    assert elapsed < 0.5, f"hydration was not parallel: took {elapsed}s"


# ───────────────────────── Tag lookups ───────────────────────────────────────


@pytest.mark.asyncio
async def test_get_plan_tags_for_projects(auth_client, test_db_session):
    client, user = auth_client
    p1 = (
        await client.post(
            "/api/plans",
            json={
                "name": "Plan 1",
                "projects": [{"app": "tasking-manager", "project_id": "10"}],
            },
        )
    ).json()
    p2 = (
        await client.post(
            "/api/plans",
            json={
                "name": "Plan 2",
                "projects": [
                    {"app": "tasking-manager", "project_id": "10"},
                    {"app": "tasking-manager", "project_id": "20"},
                ],
            },
        )
    ).json()

    tags = await plans_service.get_plan_tags_for_projects(
        test_db_session, user.id, "tasking-manager", ["10", "20", "30"]
    )
    assert {t.id for t in tags["10"]} == {p1["id"], p2["id"]}
    assert {t.id for t in tags["20"]} == {p2["id"]}
    assert "30" not in tags


# ───────────────────── Listing enrichment (tasking-manager) ──────────────────


@pytest.mark.asyncio
async def test_tasking_manager_listing_enrichment(auth_client):
    client, _ = auth_client
    resp = await client.post(
        "/api/plans",
        json={
            "name": "P",
            "projects": [{"app": "tasking-manager", "project_id": "555"}],
        },
    )
    assert resp.status_code == 201

    fake_upstream = {
        "mapResults": None,
        "results": [
            {"projectId": 555, "name": "in plan"},
            {"projectId": 999, "name": "not in plan"},
        ],
        "pagination": None,
    }

    tm_url = f"{settings.tasking_manager_api_url}/projects/"
    with respx.mock(assert_all_called=False) as mock:
        mock.get(tm_url).mock(return_value=httpx.Response(200, json=fake_upstream))
        resp = await client.get("/api/tasking-manager/projects")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()
    results = body["results"]
    assert results, f"expected results, got body={body}"
    by_id = {r["projectId"]: r for r in results}
    assert "plans" in by_id[555], f"plans missing; item={by_id[555]}"
    assert len(by_id[555]["plans"]) == 1
    assert by_id[555]["plans"][0]["name"] == "P"
    assert by_id[999]["plans"] == []

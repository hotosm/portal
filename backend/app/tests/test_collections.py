"""Tests for plan collections: CRUD, assignment, drag-and-drop, and survival.

A collection belongs to one plan, and a project belongs to at most one
collection (null = the virtual "All" bucket). The survival tests below pin the
bug this feature was rebuilt for: editing a plan used to delete and recreate
its plan_projects, which silently dropped every collection assignment.
"""

import pytest

from app.tests.conftest import make_user


async def make_plan(client, name: str = "P", projects: list[dict] | None = None) -> dict:
    resp = await client.post(
        "/api/plans",
        json={"name": name, "projects": projects if projects is not None else []},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def make_collection(client, plan_id: str, name: str, description=None) -> dict:
    resp = await client.post(
        f"/api/plans/{plan_id}/collections",
        json={"name": name, "description": description},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def get_plan(client, plan_id: str) -> dict:
    resp = await client.get(f"/api/plans/{plan_id}")
    assert resp.status_code == 200, resp.text
    return resp.json()


def collection_of(plan: dict, project_id: str) -> str | None:
    return next(p["collection_id"] for p in plan["projects"] if p["project_id"] == project_id)


# ────────────────────────────── CRUD ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_list_and_delete_collection(auth_client):
    client, _ = auth_client
    plan = await make_plan(client)

    created = await make_collection(client, plan["id"], "Imagery", "Drone flights")
    assert created["name"] == "Imagery"
    assert created["description"] == "Drone flights"
    assert created["plan_id"] == plan["id"]

    resp = await client.get(f"/api/plans/{plan['id']}/collections")
    assert [c["id"] for c in resp.json()] == [created["id"]]

    # The plan carries its collections too, so one request renders the sections.
    assert [c["id"] for c in (await get_plan(client, plan["id"]))["collections"]] == [created["id"]]

    resp = await client.delete(f"/api/plans/{plan['id']}/collections/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/plans/{plan['id']}/collections")).json() == []


@pytest.mark.asyncio
async def test_duplicate_collection_name_in_same_plan_is_rejected(auth_client):
    client, _ = auth_client
    plan = await make_plan(client)
    await make_collection(client, plan["id"], "Imagery")

    resp = await client.post(f"/api/plans/{plan['id']}/collections", json={"name": "Imagery"})
    assert resp.status_code == 422

    # …but the same name in another plan is fine: collections are per plan.
    other = await make_plan(client, "Other")
    assert (
        await client.post(f"/api/plans/{other['id']}/collections", json={"name": "Imagery"})
    ).status_code == 201


@pytest.mark.asyncio
async def test_rename_collection(auth_client):
    client, _ = auth_client
    plan = await make_plan(client)
    collection = await make_collection(client, plan["id"], "Imagery")

    resp = await client.patch(
        f"/api/plans/{plan['id']}/collections/{collection['id']}",
        json={"name": "Aerial imagery", "description": "Renamed"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["name"] == "Aerial imagery"
    assert resp.json()["description"] == "Renamed"


@pytest.mark.asyncio
async def test_collections_are_ordered_by_creation(auth_client):
    client, _ = auth_client
    plan = await make_plan(client)
    for name in ("First", "Second", "Third"):
        await make_collection(client, plan["id"], name)

    resp = await client.get(f"/api/plans/{plan['id']}/collections")
    assert [c["name"] for c in resp.json()] == ["First", "Second", "Third"]


# ─────────────────────────── assignment ──────────────────────────────────────


@pytest.mark.asyncio
async def test_assign_and_clear_project_collection(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    collection = await make_collection(client, plan["id"], "Imagery")
    row_id = plan["projects"][0]["id"]

    # Unassigned projects report null — the frontend renders them under "All".
    assert collection_of(await get_plan(client, plan["id"]), "1") is None

    resp = await client.patch(
        f"/api/plans/{plan['id']}/projects/{row_id}/collection",
        json={"collection_id": collection["id"]},
    )
    assert resp.status_code == 204, resp.text
    assert collection_of(await get_plan(client, plan["id"]), "1") == collection["id"]

    resp = await client.patch(
        f"/api/plans/{plan['id']}/projects/{row_id}/collection",
        json={"collection_id": None},
    )
    assert resp.status_code == 204
    assert collection_of(await get_plan(client, plan["id"]), "1") is None


@pytest.mark.asyncio
async def test_cannot_assign_a_collection_of_another_plan(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    other = await make_plan(client, "Other")
    foreign = await make_collection(client, other["id"], "Elsewhere")

    resp = await client.patch(
        f"/api/plans/{plan['id']}/projects/{plan['projects'][0]['id']}/collection",
        json={"collection_id": foreign["id"]},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_deleting_a_collection_sends_its_projects_to_all(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    collection = await make_collection(client, plan["id"], "Imagery")
    row_id = plan["projects"][0]["id"]
    await client.patch(
        f"/api/plans/{plan['id']}/projects/{row_id}/collection",
        json={"collection_id": collection["id"]},
    )

    resp = await client.delete(f"/api/plans/{plan['id']}/collections/{collection['id']}")
    assert resp.status_code == 204

    plan_after = await get_plan(client, plan["id"])
    assert len(plan_after["projects"]) == 1
    assert collection_of(plan_after, "1") is None


# ──────────────────────── drag and drop ──────────────────────────────────────


@pytest.mark.asyncio
async def test_reorder_moves_projects_between_collections(auth_client):
    client, _ = auth_client
    plan = await make_plan(
        client,
        projects=[
            {"app": "tasking-manager", "project_id": "1"},
            {"app": "fair", "project_id": "2"},
            {"app": "field-tm", "project_id": "3"},
        ],
    )
    collection = await make_collection(client, plan["id"], "Imagery")
    rows = {p["project_id"]: p["id"] for p in plan["projects"]}

    # Drag "3" into the collection, and swap the two left behind.
    resp = await client.patch(
        f"/api/plans/{plan['id']}/projects/reorder",
        json={
            "items": [
                {"id": rows["3"], "collection_id": collection["id"], "display_order": 0},
                {"id": rows["2"], "collection_id": None, "display_order": 0},
                {"id": rows["1"], "collection_id": None, "display_order": 1},
            ]
        },
    )
    assert resp.status_code == 204, resp.text

    plan_after = await get_plan(client, plan["id"])
    assert collection_of(plan_after, "3") == collection["id"]
    # Plan projects come back in display order, so the swap is visible here.
    unassigned = [p["project_id"] for p in plan_after["projects"] if p["collection_id"] is None]
    assert unassigned == ["2", "1"]


@pytest.mark.asyncio
async def test_reorder_rejects_a_project_of_another_plan(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    other = await make_plan(client, "Other", [{"app": "fair", "project_id": "2"}])

    resp = await client.patch(
        f"/api/plans/{plan['id']}/projects/reorder",
        json={
            "items": [
                {"id": other["projects"][0]["id"], "collection_id": None, "display_order": 0}
            ]
        },
    )
    assert resp.status_code == 404


# ─────────── the assignment survives every other plan edit ───────────────────


@pytest.mark.asyncio
async def test_collection_survives_adding_a_project(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    collection = await make_collection(client, plan["id"], "Imagery")
    await client.patch(
        f"/api/plans/{plan['id']}/projects/{plan['projects'][0]['id']}/collection",
        json={"collection_id": collection["id"]},
    )

    resp = await client.post(
        f"/api/plans/{plan['id']}/projects",
        json={"app": "fair", "project_id": "2"},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["collection_id"] is None

    plan_after = await get_plan(client, plan["id"])
    assert len(plan_after["projects"]) == 2
    assert collection_of(plan_after, "1") == collection["id"]


@pytest.mark.asyncio
async def test_add_project_into_a_collection(auth_client):
    client, _ = auth_client
    plan = await make_plan(client)
    collection = await make_collection(client, plan["id"], "Imagery")

    resp = await client.post(
        f"/api/plans/{plan['id']}/projects",
        json={"app": "fair", "project_id": "2", "collection_id": collection["id"]},
    )
    assert resp.status_code == 201, resp.text
    assert collection_of(await get_plan(client, plan["id"]), "2") == collection["id"]


@pytest.mark.asyncio
async def test_add_duplicate_project_is_rejected(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "fair", "project_id": "2"}])

    resp = await client.post(
        f"/api/plans/{plan['id']}/projects",
        json={"app": "fair", "project_id": "2"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_collection_survives_featuring_a_project(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    collection = await make_collection(client, plan["id"], "Imagery")
    row_id = plan["projects"][0]["id"]
    await client.patch(
        f"/api/plans/{plan['id']}/projects/{row_id}/collection",
        json={"collection_id": collection["id"]},
    )

    resp = await client.patch(
        f"/api/plans/{plan['id']}/projects/{row_id}/featured", json={"featured": True}
    )
    assert resp.status_code == 204, resp.text

    plan_after = await get_plan(client, plan["id"])
    assert plan_after["projects"][0]["featured"] is True
    assert collection_of(plan_after, "1") == collection["id"]


@pytest.mark.asyncio
async def test_collection_survives_deleting_another_project(auth_client):
    client, _ = auth_client
    plan = await make_plan(
        client,
        projects=[
            {"app": "tasking-manager", "project_id": "1"},
            {"app": "fair", "project_id": "2"},
        ],
    )
    collection = await make_collection(client, plan["id"], "Imagery")
    rows = {p["project_id"]: p["id"] for p in plan["projects"]}
    await client.patch(
        f"/api/plans/{plan['id']}/projects/{rows['1']}/collection",
        json={"collection_id": collection["id"]},
    )

    resp = await client.delete(f"/api/plans/{plan['id']}/projects/{rows['2']}")
    assert resp.status_code == 204

    plan_after = await get_plan(client, plan["id"])
    assert [p["project_id"] for p in plan_after["projects"]] == ["1"]
    assert collection_of(plan_after, "1") == collection["id"]


@pytest.mark.asyncio
async def test_collection_survives_a_full_projects_patch(auth_client):
    """PATCH /plans with the whole list keeps row identity, and the collections.

    This is the regression the feature was rebuilt for: the endpoint used to
    delete every plan_project and insert new ones, which cascaded the
    assignments away on any save.
    """
    client, _ = auth_client
    plan = await make_plan(
        client,
        projects=[
            {"app": "tasking-manager", "project_id": "1"},
            {"app": "fair", "project_id": "2"},
        ],
    )
    collection = await make_collection(client, plan["id"], "Imagery")
    rows = {p["project_id"]: p["id"] for p in plan["projects"]}
    await client.patch(
        f"/api/plans/{plan['id']}/projects/{rows['1']}/collection",
        json={"collection_id": collection["id"]},
    )

    # Same list, reordered, exactly as an older frontend would send it.
    resp = await client.patch(
        f"/api/plans/{plan['id']}",
        json={
            "projects": [
                {"id": rows["2"], "app": "fair", "project_id": "2"},
                {"id": rows["1"], "app": "tasking-manager", "project_id": "1"},
            ]
        },
    )
    assert resp.status_code == 200, resp.text

    plan_after = await get_plan(client, plan["id"])
    assert collection_of(plan_after, "1") == collection["id"]
    assert {p["id"] for p in plan_after["projects"]} == set(rows.values())


@pytest.mark.asyncio
async def test_projects_patch_without_ids_matches_on_app_and_project_id(auth_client):
    """A payload with no ids still matches existing rows, so nothing is recreated."""
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])
    collection = await make_collection(client, plan["id"], "Imagery")
    row_id = plan["projects"][0]["id"]
    await client.patch(
        f"/api/plans/{plan['id']}/projects/{row_id}/collection",
        json={"collection_id": collection["id"]},
    )

    resp = await client.patch(
        f"/api/plans/{plan['id']}",
        json={"projects": [{"app": "tasking-manager", "project_id": "1"}]},
    )
    assert resp.status_code == 200, resp.text

    plan_after = await get_plan(client, plan["id"])
    assert plan_after["projects"][0]["id"] == row_id
    assert collection_of(plan_after, "1") == collection["id"]


@pytest.mark.asyncio
async def test_projects_patch_still_adds_and_removes(auth_client):
    client, _ = auth_client
    plan = await make_plan(client, projects=[{"app": "tasking-manager", "project_id": "1"}])

    resp = await client.patch(
        f"/api/plans/{plan['id']}",
        json={"projects": [{"app": "fair", "project_id": "2"}]},
    )
    assert resp.status_code == 200, resp.text
    assert {(p["app"], p["project_id"]) for p in resp.json()["projects"]} == {("fair", "2")}


# ─────────────────────────── permissions ─────────────────────────────────────


@pytest.mark.asyncio
async def test_collections_are_not_visible_on_another_users_plan(two_auth_clients):
    client, user_cell = two_auth_clients
    owner = make_user("owner-id", "owner@example.com")
    stranger = make_user("stranger-id", "stranger@example.com")

    user_cell[0] = owner
    plan = await make_plan(client, "Owned")
    collection = await make_collection(client, plan["id"], "Imagery")

    user_cell[0] = stranger
    assert (await client.get(f"/api/plans/{plan['id']}/collections")).status_code == 404
    assert (
        await client.post(f"/api/plans/{plan['id']}/collections", json={"name": "Mine"})
    ).status_code == 404
    assert (
        await client.delete(f"/api/plans/{plan['id']}/collections/{collection['id']}")
    ).status_code == 404

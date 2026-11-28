"""Integration tests for the share dialog contract of a plan.

Covers `/api/plans/{id}/access…` (owner only), sharing with people by email,
with teams/organizations (own or public), the "anyone with the link" grant,
the organization attribution ("Published by") and ownership transfer. Login is
mocked: memberships through the group_ctx fixture (conftest.py), and the email
lookup and public group names by patching login_service.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services import login_service
from app.tests.test_plan_permissions import _create_plan, _grant, _group, _user


def _lookup(found: login_service.LookedUpUser | None):
    return patch.object(login_service, "lookup_user_by_email", AsyncMock(return_value=found))


def _grants(access: dict) -> dict:
    return {(g["subject_type"], g["subject_id"]): g for g in access["grants"]}


# ── /access is owner only ────────────────────────────────────────────────────

_OWNER_ONLY_CALLS = [
    ("GET", "/access", None),
    ("PUT", "/access/link", {"role": "viewer"}),
    ("DELETE", "/access/link", None),
    ("POST", "/access/user", {"email": "x@example.com", "role": "viewer"}),
    ("PUT", "/access/user/someone", {"role": "editor"}),
    ("PUT", "/access/team/t1", {"role": "viewer"}),
    ("DELETE", "/access/user/someone", None),
    ("PUT", "/access/owner", {"user_id": "someone"}),
    ("PUT", "/attribution", {"organization_id": None}),
]


@pytest.mark.asyncio
@pytest.mark.parametrize(("method", "path", "body"), _OWNER_ONLY_CALLS)
@pytest.mark.parametrize(
    ("caller", "role", "status"),
    [("editor-user", "editor", 403), ("viewer-user", "viewer", 403), ("stranger", None, 404)],
)
async def test_access_routes_are_owner_only(group_ctx, method, path, body, caller, role, status):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "someone", "viewer")
    if role is not None:
        await _grant(db, plan_id, "user", caller, role)

    user_cell[0] = _user(caller)
    with _lookup(login_service.LookedUpUser("x-id", "X")):
        resp = await client.request(method, f"/api/plans/{plan_id}{path}", json=body)
    assert resp.status_code == status, resp.text


@pytest.mark.asyncio
async def test_owner_reads_access(group_ctx):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", "editor")
    await _grant(db, plan_id, "link", None, "viewer")

    user_cell[0] = _user("owner")
    resp = await client.get(f"/api/plans/{plan_id}/access")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["owner"]["id"] == "owner"
    assert body["my_role"] == "owner"
    assert body["link_role"] == "viewer"
    assert body["link_roles"] == ["viewer"]
    assert body["owner_transfer_enabled"] is True
    # The link is reported through link_role, not as a grant.
    assert [(g["subject_type"], g["subject_id"], g["role"]) for g in body["grants"]] == [
        ("user", "friend", "editor")
    ]


# ── POST /access/user ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_add_user_by_email(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    with _lookup(login_service.LookedUpUser("friend", "Ada Lovelace")):
        resp = await client.post(
            f"/api/plans/{plan_id}/access/user",
            json={"email": "ada@example.com", "role": "editor"},
        )
    assert resp.status_code == 200, resp.text
    grant = _grants(resp.json())[("user", "friend")]
    assert grant["subject_name"] == "Ada Lovelace"
    assert grant["role"] == "editor"

    # The person now has that role on the plan.
    user_cell[0] = _user("friend")
    assert (await client.get(f"/api/plans/{plan_id}")).json()["my_role"] == "editor"


@pytest.mark.asyncio
async def test_add_user_unknown_email_is_404(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    with _lookup(None):
        resp = await client.post(
            f"/api/plans/{plan_id}/access/user", json={"email": "nobody@example.com"}
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_add_user_owner_email_is_409(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    with _lookup(login_service.LookedUpUser("owner", "Owner")):
        resp = await client.post(
            f"/api/plans/{plan_id}/access/user", json={"email": "owner@example.com"}
        )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_add_user_name_falls_back_to_email_local_part(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    with _lookup(login_service.LookedUpUser("friend", None)):
        resp = await client.post(
            f"/api/plans/{plan_id}/access/user", json={"email": " ada.lovelace@example.com "}
        )
    assert resp.status_code == 200, resp.text
    assert _grants(resp.json())[("user", "friend")]["subject_name"] == "ada.lovelace"


@pytest.mark.asyncio
async def test_add_user_login_down_is_502(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    lookup = AsyncMock(side_effect=login_service.LoginUnavailable("down"))
    with patch.object(login_service, "lookup_user_by_email", lookup):
        resp = await client.post(
            f"/api/plans/{plan_id}/access/user", json={"email": "ada@example.com"}
        )
    assert resp.status_code == 502


# ── Teams and organizations ──────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_share_with_own_team_uses_login_name(group_ctx):
    client, user_cell, memberships, _ = group_ctx
    memberships["owner"] = [_group("t1", "team", name="Mappers")]
    plan_id = await _create_plan(client, user_cell)

    public_name = AsyncMock(return_value=None)
    with patch.object(login_service, "get_public_group_name", public_name):
        resp = await client.put(f"/api/plans/{plan_id}/access/team/t1", json={"role": "editor"})
    assert resp.status_code == 200, resp.text
    assert _grants(resp.json())[("team", "t1")]["subject_name"] == "Mappers"
    public_name.assert_not_awaited()


@pytest.mark.asyncio
async def test_share_with_public_group_owner_is_not_member_of(group_ctx):
    client, user_cell, memberships, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    public_name = AsyncMock(return_value="Open Mappers")
    with patch.object(login_service, "get_public_group_name", public_name):
        resp = await client.put(
            f"/api/plans/{plan_id}/access/organization/o9", json={"role": "viewer"}
        )
    assert resp.status_code == 200, resp.text
    assert _grants(resp.json())[("organization", "o9")]["subject_name"] == "Open Mappers"
    public_name.assert_awaited_once_with("organization", "o9")

    # Its approved members can now view the plan.
    memberships["member"] = [_group("o9", "organization")]
    user_cell[0] = _user("member")
    assert (await client.get(f"/api/plans/{plan_id}")).json()["my_role"] == "viewer"


@pytest.mark.asyncio
async def test_share_with_non_public_group_owner_is_not_member_of_is_404(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    with patch.object(login_service, "get_public_group_name", AsyncMock(return_value=None)):
        resp = await client.put(f"/api/plans/{plan_id}/access/team/t9", json={"role": "viewer"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_change_user_grant_role(group_ctx):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", "viewer")

    user_cell[0] = _user("owner")
    resp = await client.put(f"/api/plans/{plan_id}/access/user/friend", json={"role": "editor"})
    assert resp.status_code == 200, resp.text
    assert _grants(resp.json())[("user", "friend")]["role"] == "editor"

    user_cell[0] = _user("friend")
    assert (await client.get(f"/api/plans/{plan_id}")).json()["my_role"] == "editor"
    assert (
        await client.patch(f"/api/plans/{plan_id}", json={"description": "y"})
    ).status_code == 200


@pytest.mark.asyncio
async def test_remove_grant(group_ctx):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", "editor")

    user_cell[0] = _user("owner")
    resp = await client.delete(f"/api/plans/{plan_id}/access/user/friend")
    assert resp.status_code == 200, resp.text
    assert resp.json()["grants"] == []

    user_cell[0] = _user("friend")
    assert (await client.get(f"/api/plans/{plan_id}")).status_code == 404


# ── PUT /access/link ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_link_viewer_makes_plan_public_and_delete_reverts_it(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    resp = await client.put(f"/api/plans/{plan_id}/access/link", json={"role": "viewer"})
    assert resp.status_code == 200, resp.text
    assert resp.json()["link_role"] == "viewer"
    assert (await client.get(f"/api/plans/shared/{plan_id}")).status_code == 200

    resp = await client.delete(f"/api/plans/{plan_id}/access/link")
    assert resp.status_code == 200, resp.text
    assert resp.json()["link_role"] is None
    assert (await client.get(f"/api/plans/shared/{plan_id}")).status_code == 404


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ["editor", "contributor"])
async def test_link_rejects_roles_not_in_link_roles(group_ctx, role):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    resp = await client.put(f"/api/plans/{plan_id}/access/link", json={"role": role})
    assert resp.status_code == 400
    assert (await client.get(f"/api/plans/{plan_id}/access")).json()["link_role"] is None


# ── PUT /attribution ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
@pytest.mark.parametrize("org_role", ["owner", "manager"])
async def test_owner_attributes_plan_to_org_they_manage(group_ctx, org_role):
    client, user_cell, memberships, _ = group_ctx
    memberships["owner"] = [_group("o1", "organization", name="HOT", role=org_role)]
    plan_id = await _create_plan(client, user_cell)

    resp = await client.put(f"/api/plans/{plan_id}/attribution", json={"organization_id": "o1"})
    assert resp.status_code == 200, resp.text
    assert resp.json()["group_id"] == "o1"
    assert resp.json()["group_name"] == "HOT"

    resp = await client.put(f"/api/plans/{plan_id}/attribution", json={"organization_id": None})
    assert resp.status_code == 200, resp.text
    assert resp.json()["group_id"] is None
    assert resp.json()["group_name"] is None


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "memberships_of_owner",
    [
        [],
        [_group("o1", "organization", role="member")],
        [_group("o1", "organization", role="owner", status="pending")],
    ],
    ids=["not-a-member", "plain-member", "unapproved-org"],
)
async def test_attribution_requires_managing_the_org(group_ctx, memberships_of_owner):
    client, user_cell, memberships, _ = group_ctx
    memberships["owner"] = memberships_of_owner
    plan_id = await _create_plan(client, user_cell)

    resp = await client.put(f"/api/plans/{plan_id}/attribution", json={"organization_id": "o1"})
    assert resp.status_code == 403
    assert (await client.get(f"/api/plans/{plan_id}")).json()["group_id"] is None


@pytest.mark.asyncio
async def test_editor_who_manages_the_org_cannot_attribute(group_ctx):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", "editor")
    memberships["friend"] = [_group("o1", "organization", role="owner")]

    user_cell[0] = _user("friend")
    resp = await client.put(f"/api/plans/{plan_id}/attribution", json={"organization_id": "o1"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_attribution_gives_the_org_no_access(group_ctx):
    client, user_cell, memberships, _ = group_ctx
    memberships["owner"] = [_group("o1", "organization", role="owner")]
    memberships["colleague"] = [_group("o1", "organization", role="manager")]
    plan_id = await _create_plan(client, user_cell)
    resp = await client.put(f"/api/plans/{plan_id}/attribution", json={"organization_id": "o1"})
    assert resp.status_code == 200, resp.text

    user_cell[0] = _user("colleague")
    assert (await client.get(f"/api/plans/{plan_id}")).status_code == 404
    assert not any(p["id"] == plan_id for p in (await client.get("/api/plans")).json())


# ── PUT /access/owner ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_transfer_ownership(group_ctx):
    client, user_cell, memberships, db = group_ctx
    memberships["owner"] = [_group("o1", "organization", role="owner")]
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", "viewer")
    await _grant(db, plan_id, "team", "t1", "viewer")

    user_cell[0] = _user("owner")
    resp = await client.put(f"/api/plans/{plan_id}/attribution", json={"organization_id": "o1"})
    assert resp.status_code == 200, resp.text

    resp = await client.put(f"/api/plans/{plan_id}/access/owner", json={"user_id": "friend"})
    assert resp.status_code == 204, resp.text
    # sqlite drops the timezone of stored datetimes; reload the grants so the
    # previous owner's new grant isn't compared, still tz-aware, against them.
    db.expire_all()

    user_cell[0] = _user("friend")
    plan = (await client.get(f"/api/plans/{plan_id}")).json()
    assert plan["my_role"] == "owner"
    assert plan["owner_id"] == "friend"
    # The attribution belonged to the previous owner, so it is cleared.
    assert plan["group_id"] is None
    assert plan["group_name"] is None

    access = (await client.get(f"/api/plans/{plan_id}/access")).json()
    assert access["owner"]["id"] == "friend"
    grants = _grants(access)
    # The new owner's grant is gone, the previous owner is an editor, and other
    # grants are left as they were.
    assert ("user", "friend") not in grants
    assert grants[("user", "owner")]["role"] == "editor"
    assert grants[("team", "t1")]["role"] == "viewer"

    # The previous owner can still edit but no longer manage.
    user_cell[0] = _user("owner")
    assert (
        await client.patch(f"/api/plans/{plan_id}", json={"description": "y"})
    ).status_code == 200
    assert (await client.get(f"/api/plans/{plan_id}/access")).status_code == 403


@pytest.mark.asyncio
async def test_transfer_to_self_is_400(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    resp = await client.put(f"/api/plans/{plan_id}/access/owner", json={"user_id": "owner"})
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_transfer_without_user_grant_is_404(group_ctx):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    # A member of a team the plan is shared with has no user grant of their own.
    await _grant(db, plan_id, "team", "t1", "editor")
    memberships["member"] = [_group("t1", "team")]

    user_cell[0] = _user("owner")
    for user_id in ("member", "nobody"):
        resp = await client.put(f"/api/plans/{plan_id}/access/owner", json={"user_id": user_id})
        assert resp.status_code == 404, user_id
    assert (await client.get(f"/api/plans/{plan_id}")).json()["owner_id"] == "owner"


@pytest.mark.asyncio
async def test_non_owner_cannot_transfer(group_ctx):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", "editor")

    user_cell[0] = _user("friend")
    resp = await client.put(f"/api/plans/{plan_id}/access/owner", json={"user_id": "friend"})
    assert resp.status_code == 403

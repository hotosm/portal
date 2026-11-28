"""Integration tests for who can view, edit and manage a plan.

A plan's owner is always a person; everyone else gets access only through a
grant (user, team, organization or "anyone with the link"), the highest role
wins, and only approved groups count. Login's group membership is mocked here
(patching login_service.get_user_groups) so these tests focus on portal's
authorization behavior (the group_ctx fixture lives in conftest.py). Grants are
set up directly in the database; the share dialog endpoints that create them
are covered in test_plan_access.py.
"""

from datetime import UTC, datetime

import pytest
from hotosm_auth.models import HankoUser

from app.db.models.plan import PlanGrant
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


def _group(gid="t1", gtype="team", name=None, role="member", status="approved"):
    return login_service.UserGroup(
        id=gid, type=gtype, slug=gid, name=name or gid, role=role, status=status
    )


async def _create_plan(client, user_cell, owner="owner"):
    user_cell[0] = _user(owner)
    resp = await client.post("/api/plans", json={"name": "Plan", "projects": []})
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


async def _grant(db, plan_id, subject_type, subject_id, role):
    db.add(PlanGrant(plan_id=plan_id, subject_type=subject_type, subject_id=subject_id, role=role))
    await db.commit()
    # Drop plans loaded by earlier requests so the next one sees the new grant.
    db.expire_all()


async def _abilities(client, user_cell, plan_id, user):
    """(my_role, can view, can edit, can manage) for `user` on the plan."""
    user_cell[0] = user
    read = await client.get(f"/api/plans/{plan_id}")
    my_role = read.json()["my_role"] if read.status_code == 200 else None
    edit = await client.patch(f"/api/plans/{plan_id}", json={"description": "x"})
    manage = await client.get(f"/api/plans/{plan_id}/access")
    return my_role, read.status_code == 200, edit.status_code == 200, manage.status_code == 200


async def _listed(client, user_cell, plan_id, user) -> bool:
    user_cell[0] = user
    return any(p["id"] == plan_id for p in (await client.get("/api/plans")).json())


@pytest.mark.asyncio
async def test_owner_can_view_edit_and_manage(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    assert await _abilities(client, user_cell, plan_id, _user("owner")) == (
        "owner",
        True,
        True,
        True,
    )
    assert await _listed(client, user_cell, plan_id, _user("owner"))


@pytest.mark.asyncio
async def test_stranger_has_no_access(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    assert await _abilities(client, user_cell, plan_id, _user("stranger")) == (
        None,
        False,
        False,
        False,
    )
    assert not await _listed(client, user_cell, plan_id, _user("stranger"))


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("role", "expected"),
    [("viewer", ("viewer", True, False, False)), ("editor", ("editor", True, True, False))],
)
async def test_user_grant(group_ctx, role, expected):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "user", "friend", role)

    assert await _abilities(client, user_cell, plan_id, _user("friend")) == expected
    assert await _listed(client, user_cell, plan_id, _user("friend"))


@pytest.mark.asyncio
@pytest.mark.parametrize("group_type", ["team", "organization"])
@pytest.mark.parametrize(
    ("role", "expected"),
    [("viewer", ("viewer", True, False, False)), ("editor", ("editor", True, True, False))],
)
async def test_group_grant_reaches_approved_members_only(group_ctx, group_type, role, expected):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, group_type, "g1", role)
    memberships["member"] = [_group("g1", group_type)]
    memberships["other"] = [_group("g2", group_type)]

    assert await _abilities(client, user_cell, plan_id, _user("member")) == expected
    assert await _listed(client, user_cell, plan_id, _user("member"))

    assert await _abilities(client, user_cell, plan_id, _user("other")) == (
        None,
        False,
        False,
        False,
    )
    assert not await _listed(client, user_cell, plan_id, _user("other"))


@pytest.mark.asyncio
async def test_group_role_does_not_matter_only_the_grant(group_ctx):
    """An org owner/manager gets the grant's role, never owner of the plan."""
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "organization", "o1", "viewer")
    memberships["boss"] = [_group("o1", "organization", role="owner")]

    assert await _abilities(client, user_cell, plan_id, _user("boss")) == (
        "viewer",
        True,
        False,
        False,
    )


@pytest.mark.asyncio
async def test_unapproved_org_grant_gives_no_access(group_ctx):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "organization", "o1", "editor")
    memberships["member"] = [_group("o1", "organization", status="pending")]

    assert await _abilities(client, user_cell, plan_id, _user("member")) == (
        None,
        False,
        False,
        False,
    )


@pytest.mark.asyncio
async def test_unapproved_org_grant_does_not_list_the_plan(group_ctx):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "organization", "o1", "editor")
    memberships["member"] = [_group("o1", "organization", status="pending")]

    assert not await _listed(client, user_cell, plan_id, _user("member"))


@pytest.mark.asyncio
async def test_link_grant_lets_anyone_view_but_not_edit(group_ctx):
    client, user_cell, _, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "link", None, "viewer")

    assert await _abilities(client, user_cell, plan_id, _user("stranger")) == (
        "viewer",
        True,
        False,
        False,
    )
    # A link grant alone doesn't put the plan in someone's list.
    assert not await _listed(client, user_cell, plan_id, _user("stranger"))

    # Anonymous visitors read it through /shared.
    user_cell[0] = None
    resp = await client.get(f"/api/plans/shared/{plan_id}")
    assert resp.status_code == 200
    assert resp.json()["is_public"] is True
    assert resp.json()["can_edit"] is False


@pytest.mark.asyncio
async def test_plan_without_link_is_not_shared(group_ctx):
    client, user_cell, _, _ = group_ctx
    plan_id = await _create_plan(client, user_cell)

    user_cell[0] = None
    assert (await client.get(f"/api/plans/shared/{plan_id}")).status_code == 404


@pytest.mark.asyncio
async def test_highest_role_wins(group_ctx):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "link", None, "viewer")
    await _grant(db, plan_id, "user", "friend", "viewer")
    await _grant(db, plan_id, "team", "t1", "editor")
    memberships["friend"] = [_group("t1", "team")]

    assert await _abilities(client, user_cell, plan_id, _user("friend")) == (
        "editor",
        True,
        True,
        False,
    )

    # Without the team, the best left is viewer (user grant / link).
    memberships["friend"] = []
    assert await _abilities(client, user_cell, plan_id, _user("friend")) == (
        "viewer",
        True,
        False,
        False,
    )


@pytest.mark.asyncio
async def test_login_down_keeps_owner_and_user_grants_but_drops_group_access(group_ctx):
    client, user_cell, memberships, db = group_ctx
    plan_id = await _create_plan(client, user_cell)
    await _grant(db, plan_id, "team", "t1", "editor")
    await _grant(db, plan_id, "user", "friend", "editor")
    memberships["member"] = [_group("t1", "team")]

    assert (await _abilities(client, user_cell, plan_id, _user("member")))[0] == "editor"

    memberships["__down__"] = True

    # The owner check is local: the owner still views, edits and manages.
    assert await _abilities(client, user_cell, plan_id, _user("owner")) == (
        "owner",
        True,
        True,
        True,
    )
    # A person's own grant doesn't depend on login either.
    assert (await _abilities(client, user_cell, plan_id, _user("friend")))[:3] == (
        "editor",
        True,
        True,
    )
    # Membership-based access fails closed.
    assert await _abilities(client, user_cell, plan_id, _user("member")) == (
        None,
        False,
        False,
        False,
    )
    assert not await _listed(client, user_cell, plan_id, _user("member"))

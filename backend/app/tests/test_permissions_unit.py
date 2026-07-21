"""Pure unit tests for plan view/edit resolution."""

from types import SimpleNamespace

from app.services.permissions import PermissionContext, can_edit, can_view, is_member


def _plan(**kw):
    base = {
        "owner_id": "owner",
        "visibility": "private",
        "group_type": None,
        "group_id": None,
        "edit_scope": "owner",
    }
    base.update(kw)
    return SimpleNamespace(**base)


def _ctx(user_id="owner", memberships=frozenset(), login_ok=True):
    return PermissionContext(user_id, memberships, login_ok)


def test_owner_can_always_view_and_edit():
    plan = _plan()
    ctx = _ctx("owner")
    assert can_view(plan, ctx)
    assert can_edit(plan, ctx)


def test_private_personal_hidden_from_others():
    plan = _plan()
    ctx = _ctx("stranger")
    assert not can_view(plan, ctx)
    assert not can_edit(plan, ctx)


def test_public_visible_to_anyone():
    plan = _plan(visibility="public")
    assert can_view(plan, _ctx(None))
    assert can_view(plan, _ctx("stranger"))
    # ...but not editable by non-owners.
    assert not can_edit(plan, _ctx("stranger"))


def test_group_visibility_requires_membership():
    plan = _plan(visibility="group", group_type="team", group_id="t1")
    member = _ctx("member", frozenset({("team", "t1")}))
    outsider = _ctx("outsider", frozenset({("team", "other")}))
    assert can_view(plan, member)
    assert not can_view(plan, outsider)


def test_group_edit_scope_owner_blocks_members():
    plan = _plan(
        visibility="group", group_type="team", group_id="t1", edit_scope="owner"
    )
    member = _ctx("member", frozenset({("team", "t1")}))
    assert can_view(plan, member)
    assert not can_edit(plan, member)


def test_group_edit_scope_group_allows_members():
    plan = _plan(
        visibility="group", group_type="team", group_id="t1", edit_scope="group"
    )
    member = _ctx("member", frozenset({("team", "t1")}))
    assert can_edit(plan, member)


def test_owner_edits_even_when_login_down():
    # login_ok=False => empty memberships, but owner check is local.
    plan = _plan(visibility="group", group_type="team", group_id="t1")
    ctx = _ctx("owner", frozenset(), login_ok=False)
    assert can_view(plan, ctx)
    assert can_edit(plan, ctx)


def test_member_fails_closed_when_login_down():
    plan = _plan(
        visibility="group", group_type="team", group_id="t1", edit_scope="group"
    )
    ctx = _ctx("member", frozenset(), login_ok=False)
    assert not can_view(plan, ctx)
    assert not can_edit(plan, ctx)


def test_is_member_none_group():
    assert not is_member(_ctx(), None, None)

# portal/backend/app/tests/test_resolve_project_url.py

"""Tests for plans_service.resolve_project_url — OAM TMS fast-path (issue #none)."""

from unittest.mock import patch

import pytest

from app.services import plans_service


@pytest.mark.asyncio
async def test_resolve_oam_tms_url_returns_immediately():
    """A TMS tile URL resolves without waiting on OAM's slow catalog search.

    Adding a project shouldn't block on the up-to-20s uuid search needed to
    find a TMS URL's title (see open_aerial_map_service.find_image_by_tms_ids).
    upstream is None immediately; the title fills in on a later plan hydration.
    """
    url = (
        "https://tiles.openaerialmap.org/6a029b68ef395bce007be43a/0/"
        "6a029b68ef395bce007be43b/{z}/{x}/{y}"
    )
    with patch.object(plans_service.open_aerial_map_service, "schedule_tms_warmup") as warmup:
        result = await plans_service.resolve_project_url(url)

    assert result.app == "open-aerial-map"
    assert result.project_id == "tms:6a029b68ef395bce007be43a:6a029b68ef395bce007be43b"
    assert result.upstream is None
    warmup.assert_called_once_with(result.project_id)


@pytest.mark.asyncio
async def test_resolve_oam_tms_url_skips_the_live_verification_path():
    """The generic upstream-verification path is never reached for a TMS id."""
    url = "https://tiles.openaerialmap.org/6a029b68ef395bce007be43a/0/6a029b68ef395bce007be43b/{z}/{x}/{y}"
    with (
        patch.object(plans_service.open_aerial_map_service, "schedule_tms_warmup"),
        patch.object(plans_service, "_fetch_by_app_project") as fetch_by_app_project,
    ):
        await plans_service.resolve_project_url(url)

    fetch_by_app_project.assert_not_called()

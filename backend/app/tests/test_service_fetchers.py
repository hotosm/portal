"""Unit tests for the per-service fetch-by-id helpers (cache + transform + errors)."""

from contextlib import contextmanager
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.core.cache import get_cached
from app.services import (
    chatmap_service,
    drone_tm_service,
    export_tool_service,
    fair_service,
    field_tm_service,
    open_aerial_map_service,
    tasking_manager_service,
    umap_service,
)
from app.services.exceptions import UpstreamUnavailable


def _resp(status: int = 200, json_data=None, text: str = "") -> MagicMock:
    r = MagicMock()
    r.status_code = status
    r.json = MagicMock(return_value=json_data)
    r.text = text
    r.raise_for_status = MagicMock()
    return r


@contextmanager
def patched_get(*, return_value=None, side_effect=None):
    """Patch httpx.AsyncClient so make_client(...).get returns/raises as configured."""
    with patch("httpx.AsyncClient") as mc:
        client = mc.return_value.__aenter__.return_value
        client.get = AsyncMock(return_value=return_value, side_effect=side_effect)
        yield client


# ── fair_service.fetch_model_by_id ────────────────────────────────────────────


@pytest.mark.asyncio
async def test_fair_fetch_model_success_and_cache():
    with patched_get(return_value=_resp(json_data={"id": 7, "name": "Model"})):
        out = await fair_service.fetch_model_by_id("7")
    assert out == {"id": 7, "name": "Model"}
    assert get_cached("fair_model_7") == out  # cached for next call

    # Second call is served from cache: no new HTTP client used.
    with patch("httpx.AsyncClient") as mc:
        again = await fair_service.fetch_model_by_id("7")
        mc.assert_not_called()
    assert again == out


@pytest.mark.asyncio
async def test_fair_fetch_model_404_returns_none():
    with patched_get(return_value=_resp(status=404)):
        assert await fair_service.fetch_model_by_id("404") is None


@pytest.mark.asyncio
async def test_fair_fetch_model_upstream_error_raises():
    with patched_get(side_effect=httpx.RequestError("boom")):
        with pytest.raises(UpstreamUnavailable):
            await fair_service.fetch_model_by_id("7")


# ── drone_tm_service ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_drone_fetch_project_success():
    with patched_get(return_value=_resp(json_data={"id": "p1", "name": "RG"})):
        out = await drone_tm_service.fetch_project_by_id("p1")
    assert out["name"] == "RG"


@pytest.mark.asyncio
async def test_drone_fetch_project_404_returns_none():
    with patched_get(return_value=_resp(status=404)):
        assert await drone_tm_service.fetch_project_by_id("nope") is None


def test_drone_verify_ssl_logic(monkeypatch):
    # http base -> always verify=False (no TLS to verify)
    assert drone_tm_service.verify_ssl("http://drone.local") is True
    # https base -> follows settings flag
    monkeypatch.setattr(drone_tm_service.settings, "drone_tm_verify_ssl", False)
    assert drone_tm_service.verify_ssl("https://drone.hotosm.org") is False
    monkeypatch.setattr(drone_tm_service.settings, "drone_tm_verify_ssl", True)
    assert drone_tm_service.verify_ssl("https://drone.hotosm.org") is True


# ── export_tool_service ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_export_fetch_job_success_and_404():
    with patched_get(return_value=_resp(json_data={"uid": "abc"})):
        assert (await export_tool_service.fetch_job_by_uid("abc"))["uid"] == "abc"
    with patched_get(return_value=_resp(status=404)):
        assert await export_tool_service.fetch_job_by_uid("missing") is None


@pytest.mark.asyncio
async def test_export_fetch_job_upstream_error_raises():
    with patched_get(side_effect=httpx.HTTPStatusError("x", request=MagicMock(), response=MagicMock())):
        with pytest.raises(UpstreamUnavailable):
            await export_tool_service.fetch_job_by_uid("abc")


# ── tasking_manager_service.fetch_project_by_id (transform) ───────────────────


@pytest.mark.asyncio
async def test_tm_fetch_project_filters_fields():
    payload = {
        "projectInfo": {"name": "Mapathon"},
        "organisationName": "HOT",
        "organisationSlug": "hot",
        "percentMapped": 42,
        "ignored": "dropped",
    }
    with patched_get(return_value=_resp(json_data=payload)):
        out = await tasking_manager_service.fetch_project_by_id("9")
    assert out["name"] == "Mapathon"
    assert out["organisationName"] == "HOT"
    assert out["percentMapped"] == 42
    assert "ignored" not in out


# ── open_aerial_map_service.fetch_imagery_by_id (compound id + transform) ─────


@pytest.mark.asyncio
async def test_oam_fetch_imagery_success_with_compound_id():
    payload = {"results": [{"title": "Scene", "properties": {"thumbnail": "t.png"}, "bbox": [1, 2, 3, 4]}]}
    with patched_get(return_value=_resp(json_data=payload)) as client:
        # compound "{user}:{image}" id -> only the image part is used in the URL.
        out = await open_aerial_map_service.fetch_imagery_by_id("user123:img456")
    assert out == {"title": "Scene", "thumbnail": "t.png", "bbox": [1, 2, 3, 4]}
    assert "img456" in client.get.call_args.args[0]


@pytest.mark.asyncio
async def test_oam_fetch_imagery_empty_results_returns_none():
    with patched_get(return_value=_resp(json_data={"results": []})):
        assert await open_aerial_map_service.fetch_imagery_by_id("img") is None


# ── chatmap_service.fetch_map_by_id (centroid + private handling) ─────────────


@pytest.mark.asyncio
async def test_chatmap_fetch_map_computes_centroid():
    payload = {
        "name": "Survey",
        "id": "uuid-1",
        "features": [
            {"geometry": {"type": "Point", "coordinates": [10, 20]}},
            {"geometry": {"type": "Point", "coordinates": [30, 40]}},
        ],
    }
    with patched_get(return_value=_resp(json_data=payload)):
        out = await chatmap_service.fetch_map_by_id("uuid-1")
    assert out["name"] == "Survey"
    assert out["centroid"] == [30.0, 20.0]  # [avg lat, avg lon]


@pytest.mark.asyncio
async def test_chatmap_fetch_map_private_returns_none():
    with patched_get(return_value=_resp(status=403)):
        assert await chatmap_service.fetch_map_by_id("uuid-1") is None


# ── field_tm_service.fetch_project_by_id (HTML title parse, never raises) ─────


@pytest.mark.asyncio
async def test_field_tm_parses_title():
    html = "<html><head><title>Quarry Survey - Field Tasking Manager</title></head></html>"
    with patched_get(return_value=_resp(text=html)):
        out = await field_tm_service.fetch_project_by_id("12")
    assert out == {"id": 12, "name": "Quarry Survey", "base_url": "https://field.hotosm.org"}


@pytest.mark.asyncio
async def test_field_tm_network_error_returns_none():
    # field_tm swallows all errors and returns None (never raises).
    with patched_get(side_effect=httpx.RequestError("down")):
        assert await field_tm_service.fetch_project_by_id("12") is None


# ── umap_service ──────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_umap_fetch_by_location_requires_packed_id():
    # project_id without a "/" separator -> None, no HTTP call.
    with patch("httpx.AsyncClient") as mc:
        assert await umap_service.fetch_map_by_location("no-slash") is None
        mc.assert_not_called()


@pytest.mark.asyncio
async def test_umap_fetch_by_location_success():
    geojson = {"type": "FeatureCollection", "features": []}
    with patched_get(return_value=_resp(json_data=geojson)):
        out = await umap_service.fetch_map_by_location("loc/uuid-1")
    assert out == geojson
    assert get_cached("umap_loc_uuid-1") == geojson


@pytest.mark.asyncio
async def test_umap_fetch_by_id_returns_properties():
    with patched_get(return_value=_resp(json_data={"properties": {"name": "My Map"}})):
        out = await umap_service.fetch_map_by_id("42")
    assert out == {"name": "My Map"}

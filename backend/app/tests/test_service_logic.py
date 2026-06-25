"""Unit tests for business logic extracted from routes into services."""

import base64
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.cache import get_cached, set_cached
from app.services import drone_tm_service, tasking_manager_service


def _make_jwt(payload: dict) -> str:
    """Build a JWT-like token (header.payload.signature) with an unsigned payload."""
    raw = json.dumps(payload).encode("utf-8")
    body = base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")  # no padding, like real JWTs
    return f"header.{body}.signature"


# ── drone_tm_service.extract_hanko_user_id_from_token ─────────────────────────


@pytest.mark.parametrize(
    "payload, expected",
    [
        ({"sub": "user-123"}, "user-123"),
        ({"hanko_user_id": "hk-9"}, "hk-9"),
        ({"user_id": "u-7"}, "u-7"),
        # precedence: sub wins over the others
        ({"sub": "s", "hanko_user_id": "h", "user_id": "u"}, "s"),
    ],
)
def test_extract_hanko_user_id_valid(payload, expected):
    assert drone_tm_service.extract_hanko_user_id_from_token(_make_jwt(payload)) == expected


@pytest.mark.parametrize(
    "token",
    [
        "not-a-jwt",                 # no dot -> fewer than 2 parts
        "",                          # empty
        "header.&&&notbase64.sig",   # payload not valid base64/json
        f"header.{base64.urlsafe_b64encode(b'{}').decode().rstrip('=')}.sig",  # valid json, no id keys
    ],
)
def test_extract_hanko_user_id_invalid_returns_none(token):
    assert drone_tm_service.extract_hanko_user_id_from_token(token) is None


# ── tasking_manager_service.enrich_data_with_names ────────────────────────────


def test_enrich_data_with_names_fills_features_and_results():
    data = {
        "mapResults": {
            "features": [
                {"properties": {"projectId": 1}},
                {"properties": {"projectId": 2, "name": "old"}},  # overwritten with map name
                {"properties": {"projectId": 99}},  # unknown id, left untouched
            ]
        },
        "results": [
            {"projectId": 1},                     # filled in
            {"projectId": 2, "name": "keep me"},   # already named -> kept
            {"projectId": 99},                     # unknown id, no name added
        ],
    }
    names = {1: "Project One", 2: "Project Two"}

    out = tasking_manager_service.enrich_data_with_names(data, names)

    features = out["mapResults"]["features"]
    assert features[0]["properties"]["name"] == "Project One"
    assert features[1]["properties"]["name"] == "Project Two"
    assert "name" not in features[2]["properties"]

    results = out["results"]
    assert results[0]["name"] == "Project One"
    assert results[1]["name"] == "keep me"   # existing result name is preserved
    assert "name" not in results[2]


def test_enrich_data_with_names_handles_missing_sections():
    # No mapResults / results keys -> returns data unchanged, no error.
    data = {"pagination": {"total": 0}}
    assert tasking_manager_service.enrich_data_with_names(data, {1: "x"}) == data


# ── tasking_manager_service.fetch_all_project_names ───────────────────────────


def _client_returning_pages(pages: list[list[dict]]):
    """A mock async client whose .get() yields one page of results per call."""
    calls = {"n": 0}

    async def _get(url, params=None):
        idx = calls["n"]
        calls["n"] += 1
        body = pages[idx] if idx < len(pages) else []
        response = MagicMock()
        response.raise_for_status = MagicMock()
        response.json = MagicMock(return_value={"results": body})
        return response

    client = MagicMock()
    client.get = AsyncMock(side_effect=_get)
    return client


@pytest.mark.asyncio
async def test_fetch_all_project_names_aggregates_pages():
    pages = [
        [{"projectId": 1, "name": "One"}, {"projectId": 2, "name": "Two"}],
        [{"projectId": 3, "name": "Three"}, {"projectId": 4}],  # missing name skipped
    ]
    client = _client_returning_pages(pages)

    # total=4 with per_page=2 -> 2 pages requested
    names = await tasking_manager_service.fetch_all_project_names(client, total_projects=4, per_page=2)

    assert names == {1: "One", 2: "Two", 3: "Three"}
    assert client.get.await_count == 2


@pytest.mark.asyncio
async def test_fetch_all_project_names_skips_failed_pages():
    async def _get(url, params=None):
        raise RuntimeError("boom")

    client = MagicMock()
    client.get = AsyncMock(side_effect=_get)

    names = await tasking_manager_service.fetch_all_project_names(client, total_projects=2, per_page=2)

    assert names == {}  # failures are swallowed, not raised


# ── tasking_manager_service.fetch_and_enrich_in_background ─────────────────────


@pytest.mark.asyncio
async def test_fetch_and_enrich_in_background_updates_cache_from_base():
    """With base data already cached, enrichment fills names and sets the done flag."""
    base_data = {
        "pagination": {"total": 2},
        "mapResults": {"features": [{"properties": {"projectId": 1}}]},
        "results": [{"projectId": 1}, {"projectId": 2}],
    }
    set_cached(tasking_manager_service.PROJECTS_CACHE_KEY, base_data)

    # The only HTTP calls are the name-pagination requests.
    name_page = {"results": [{"projectId": 1, "name": "Alpha"}, {"projectId": 2, "name": "Beta"}]}
    response = MagicMock()
    response.raise_for_status = MagicMock()
    response.json = MagicMock(return_value=name_page)

    with patch("httpx.AsyncClient") as mock_client:
        client = mock_client.return_value.__aenter__.return_value
        client.get = AsyncMock(return_value=response)

        await tasking_manager_service.fetch_and_enrich_in_background()

    enriched = get_cached(tasking_manager_service.PROJECTS_CACHE_KEY)
    assert enriched["results"][0]["name"] == "Alpha"
    assert enriched["results"][1]["name"] == "Beta"
    assert enriched["mapResults"]["features"][0]["properties"]["name"] == "Alpha"
    # The "enrichment done" flag is set.
    assert get_cached(tasking_manager_service.PROJECTS_ENRICHED_CACHE_KEY) is True


@pytest.mark.asyncio
async def test_fetch_and_enrich_in_background_single_flight(monkeypatch):
    """A second concurrent run returns immediately while one is in progress."""
    monkeypatch.setattr(tasking_manager_service, "_enrichment_in_progress", True)

    with patch("httpx.AsyncClient") as mock_client:
        await tasking_manager_service.fetch_and_enrich_in_background()
        mock_client.assert_not_called()  # guarded: no HTTP client created

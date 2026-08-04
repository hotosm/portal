# portal/backend/app/tests/api/open_aerial_map/test_open_aerial_map_service.py

"""Tests for app/services/open_aerial_map_service.py — TMS tile URL resolution."""

import asyncio

import pytest
import respx
from httpx import Response

from app.core.cache import clear_cache
from app.services import open_aerial_map_service
from app.services.exceptions import UpstreamUnavailable

_OAM_API = "https://api.openaerialmap.org"


@pytest.fixture(autouse=True)
def _clear_cache():
    clear_cache()
    yield
    clear_cache()


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_match():
    """A 'tms:{id1}:{id2}' id resolves via uuid-substring search, not /meta/{id}."""
    mock_response = {
        "meta": {"found": 1},
        "results": [
            {
                "_id": "691e75d9628460062aec9418",
                "uuid": "https://oin-hotosm-temp.s3.amazonaws.com/691e7375628460062aec8bca/0/691e7375628460062aec8bcb.tif",
                "title": "Spanish EMT Falmouth",
                "bbox": [-77.66, 18.49, -77.65, 18.49],
                "properties": {"thumbnail": "https://example.com/thumb.png"},
            }
        ],
    }
    route = respx.get(f"{_OAM_API}/meta").mock(return_value=Response(200, json=mock_response))

    result = await open_aerial_map_service.fetch_imagery_by_id(
        "tms:691e7375628460062aec8bca:691e7375628460062aec8bcb"
    )

    assert result == {
        "title": "Spanish EMT Falmouth",
        "thumbnail": "https://example.com/thumb.png",
        "bbox": [-77.66, 18.49, -77.65, 18.49],
    }
    assert route.called
    request = route.calls.last.request
    params = dict(request.url.params)
    assert params["limit"] == "2000"
    assert params["page"] == "1"
    # Fast path: a match on page 1 alone shouldn't trigger any further fetches.
    assert route.call_count == 1


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_no_match():
    """No match, and page 1 is smaller than the page size -> None after a single call."""
    mock_response = {"meta": {"found": 1}, "results": [{"_id": "abc", "uuid": "https://x/other/0/ids.tif"}]}
    route = respx.get(f"{_OAM_API}/meta").mock(return_value=Response(200, json=mock_response))

    result = await open_aerial_map_service.fetch_imagery_by_id("tms:aaaa:bbbb")

    assert result is None
    assert route.call_count == 1


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_paginates_until_match(monkeypatch):
    """A match past page 1 is found by paging (one page per round here) past full pages."""
    monkeypatch.setattr(open_aerial_map_service, "_META_PAGE_SIZE", 1)
    monkeypatch.setattr(open_aerial_map_service, "_META_PAGE_BATCH", 1)
    page1 = {"meta": {"found": 2}, "results": [{"_id": "1", "uuid": "https://x/other/0/other.tif"}]}
    page2 = {
        "meta": {"found": 2},
        "results": [{"_id": "2", "uuid": "https://x/id1/0/id2.tif", "title": "On page 2"}],
    }
    route = respx.get(f"{_OAM_API}/meta").mock(
        side_effect=[Response(200, json=page1), Response(200, json=page2)]
    )

    result = await open_aerial_map_service.fetch_imagery_by_id("tms:id1:id2")

    assert result == {"title": "On page 2", "thumbnail": None, "bbox": None}
    assert route.call_count == 2


@pytest.mark.asyncio
async def test_run_batch_returns_as_soon_as_match_found(monkeypatch):
    """A match on a fast page returns without waiting for a slower sibling.

    Regression test: asyncio.gather() would block on the slowest page in the
    batch even after a faster sibling already had the match, so one straggler
    page could drag a real, fast match out past the overall search timeout.
    """
    monkeypatch.setattr(open_aerial_map_service, "_META_PAGE_SIZE", 1)

    async def fake_fetch(client, page):
        if page == 3:
            await asyncio.sleep(0.05)
            return [{"_id": "3", "uuid": "https://x/id1/0/id2.tif", "title": "Fast match"}]
        await asyncio.sleep(5)  # slow straggler with no match — must not be waited on
        return [{"_id": str(page), "uuid": f"https://x/o{page}/0/o{page}.tif"}]

    monkeypatch.setattr(open_aerial_map_service, "_fetch_meta_page", fake_fetch)

    loop = asyncio.get_event_loop()
    t0 = loop.time()
    match, reached_last_page = await open_aerial_map_service._run_batch(
        None, [2, 3, 4], "/id1/0/id2"
    )
    elapsed = loop.time() - t0

    assert match == {"title": "Fast match", "thumbnail": None, "bbox": None}
    assert elapsed < 1, f"waited {elapsed:.1f}s — should have returned as soon as page 3 matched"


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_batches_pages_concurrently(monkeypatch):
    """Past page 1, pages are fetched _META_PAGE_BATCH at a time in one round."""
    monkeypatch.setattr(open_aerial_map_service, "_META_PAGE_SIZE", 1)
    monkeypatch.setattr(open_aerial_map_service, "_META_PAGE_BATCH", 5)
    monkeypatch.setattr(open_aerial_map_service, "_META_MAX_PAGES", 6)
    page1 = {"meta": {"found": 6}, "results": [{"_id": "1", "uuid": "https://x/other/0/other.tif"}]}

    def other(n: int) -> dict:
        return {"meta": {"found": 6}, "results": [{"_id": str(n), "uuid": f"https://x/o{n}/0/o{n}.tif"}]}

    page4 = {
        "meta": {"found": 6},
        "results": [{"_id": "4", "uuid": "https://x/id1/0/id2.tif", "title": "On page 4"}],
    }
    # page 1 (fast path, no match) then the batch for pages 2-6, in order.
    responses = [Response(200, json=page1)] + [
        Response(200, json=(page4 if p == 4 else other(p))) for p in range(2, 7)
    ]
    route = respx.get(f"{_OAM_API}/meta").mock(side_effect=responses)

    result = await open_aerial_map_service.fetch_imagery_by_id("tms:id1:id2")

    assert result == {"title": "On page 4", "thumbnail": None, "bbox": None}
    # page 1 + the full batch of pages 2-6, even though the match was on page 4 —
    # the batch is fetched concurrently before any of it is inspected.
    assert route.call_count == 6


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_stops_at_max_pages(monkeypatch):
    """When every page is full and nothing matches, the search stops at the page cap."""
    monkeypatch.setattr(open_aerial_map_service, "_META_PAGE_SIZE", 1)
    monkeypatch.setattr(open_aerial_map_service, "_META_MAX_PAGES", 3)
    full_page = {"meta": {"found": 100}, "results": [{"_id": "x", "uuid": "https://x/other/0/other.tif"}]}
    route = respx.get(f"{_OAM_API}/meta").mock(return_value=Response(200, json=full_page))

    result = await open_aerial_map_service.fetch_imagery_by_id("tms:id1:id2")

    assert result is None
    # page 1 (fast path) + batch covering pages 2-3 (capped by _META_MAX_PAGES).
    assert route.call_count == 3


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_search_timeout(monkeypatch):
    """A slow OAM is reported as UpstreamUnavailable, not a false 'not found'."""
    monkeypatch.setattr(open_aerial_map_service, "_META_SEARCH_TIMEOUT", 0.01)

    async def _slow_page(client, page):
        await asyncio.sleep(1)
        return []

    monkeypatch.setattr(open_aerial_map_service, "_fetch_meta_page", _slow_page)

    with pytest.raises(UpstreamUnavailable):
        await open_aerial_map_service.fetch_imagery_by_id("tms:id1:id2")


@pytest.mark.asyncio
@respx.mock
async def test_fetch_imagery_by_id_tms_uses_cache():
    """A second lookup within the TTL window does not re-hit the OAM API."""
    mock_response = {
        "meta": {"found": 1},
        "results": [
            {
                "_id": "1",
                "uuid": "https://x/id1/0/id2.tif",
                "title": "Cached image",
            }
        ],
    }
    route = respx.get(f"{_OAM_API}/meta").mock(return_value=Response(200, json=mock_response))

    first = await open_aerial_map_service.fetch_imagery_by_id("tms:id1:id2")
    second = await open_aerial_map_service.fetch_imagery_by_id("tms:id1:id2")

    assert first == second == {"title": "Cached image", "thumbnail": None, "bbox": None}
    assert route.call_count == 1

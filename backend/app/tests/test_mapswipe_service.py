"""Tests for the MapSwipe fetcher.

MapSwipe has no API: the fetcher scrapes __NEXT_DATA__ out of the project page,
so the shape it parses can change under it at any time. What matters here is
that only a real 404 reads as "deleted" — every other surprise has to read as a
transient failure, because plan hydration answers a "deleted" by clearing the
row's project_id (see plans_service._hydrate_live_and_persist).
"""

import httpx
import pytest
import respx

from app.services import mapswipe_service
from app.services.exceptions import UpstreamUnavailable

PROJECT_URL = "https://mapswipe.org/en/projects/abc123/"


def _page(next_data: str) -> str:
    return f'<html><body><script id="__NEXT_DATA__" type="application/json">{next_data}</script></body></html>'


@respx.mock
@pytest.mark.asyncio
async def test_returns_project_on_200():
    respx.get(PROJECT_URL).mock(
        return_value=httpx.Response(
            200, text=_page('{"props": {"pageProps": {"name": "Flood mapping"}}}')
        )
    )
    result = await mapswipe_service.fetch_project_by_id("abc123", force_refresh=True)
    assert result is not None
    assert result["name"] == "Flood mapping"


@respx.mock
@pytest.mark.asyncio
async def test_returns_none_on_404():
    """A real 404 is the one answer that means the project is gone."""
    respx.get(PROJECT_URL).mock(return_value=httpx.Response(404))
    assert await mapswipe_service.fetch_project_by_id("abc123", force_refresh=True) is None


@respx.mock
@pytest.mark.asyncio
async def test_raises_when_200_carries_no_project_name():
    """A renamed field is MapSwipe changing its markup, not deleting a project."""
    respx.get(PROJECT_URL).mock(
        return_value=httpx.Response(
            200, text=_page('{"props": {"pageProps": {"projectName": "Flood mapping"}}}')
        )
    )
    with pytest.raises(UpstreamUnavailable):
        await mapswipe_service.fetch_project_by_id("abc123", force_refresh=True)


@respx.mock
@pytest.mark.asyncio
async def test_raises_when_next_data_shape_is_unexpected():
    """props/pageProps missing entirely used to raise KeyError straight out of
    the fetcher, past the caller's except clause."""
    respx.get(PROJECT_URL).mock(
        return_value=httpx.Response(200, text=_page('{"something": "else"}'))
    )
    with pytest.raises(UpstreamUnavailable):
        await mapswipe_service.fetch_project_by_id("abc123", force_refresh=True)

"""Unit tests for core.cache.get_or_fetch (single-flight + no caching of failures)."""

import asyncio

import pytest

from app.core import cache
from app.core.cache import clear_cache, get_cached, get_or_fetch


@pytest.fixture(autouse=True)
def _clean_cache():
    clear_cache()
    cache._inflight.clear()
    yield
    clear_cache()
    cache._inflight.clear()


async def test_concurrent_callers_share_one_fetch():
    calls = 0

    async def fetch():
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.05)
        return {"value": 1}

    results = await asyncio.gather(*(get_or_fetch("k", fetch) for _ in range(5)))

    assert calls == 1
    assert all(r == {"value": 1} for r in results)


async def test_result_is_cached_after_fetch():
    async def fetch():
        return {"value": 2}

    await get_or_fetch("k", fetch)

    assert get_cached("k") == {"value": 2}


async def test_cache_hit_skips_fetch():
    calls = 0

    async def fetch():
        nonlocal calls
        calls += 1
        return "data"

    await get_or_fetch("k", fetch)
    await get_or_fetch("k", fetch)

    assert calls == 1


async def test_failures_are_not_cached_and_propagate():
    async def failing():
        raise RuntimeError("upstream down")

    with pytest.raises(RuntimeError):
        await get_or_fetch("k", failing)

    assert get_cached("k") is None
    assert "k" not in cache._inflight

    async def ok():
        return "recovered"

    assert await get_or_fetch("k", ok) == "recovered"

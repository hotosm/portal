"""OpenAerialMap service: reusable fetch-by-id with caching (API fallback)."""

import asyncio
import logging

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.services.exceptions import UpstreamUnavailable

logger = logging.getLogger(__name__)

# Always use the public OAM API for individual image lookups (plan hydration,
# URL resolution). settings.oam_api_url is for the local STAC sync (oam_service.py).
_OAM_PUBLIC_API = "https://api.openaerialmap.org"


_META_PAGE_SIZE = 2000
_META_MAX_PAGES = 15  # covers ~30k images — headroom above OAM's current ~21k catalog
_META_PAGE_BATCH = 5  # pages fetched concurrently per round (OAM's /meta is slow: ~3-11s/page)
_META_SEARCH_TIMEOUT = 20.0  # overall budget for the whole paginated search
_META_PAGE_CACHE_PREFIX = "oam_meta_page_"

# Marks a project_id produced by url_resolver for a TMS tile URL (see
# find_image_by_tms_ids) — its two ids are S3 object-path segments, not OAM's
# _id/user_id, so they need the uuid-substring search instead of /meta/{id}.
TMS_ID_PREFIX = "tms:"


def is_tms_project_id(project_id: str) -> bool:
    return project_id.startswith(TMS_ID_PREFIX)


def parse_tms_project_id(project_id: str) -> tuple[str, str]:
    """Split a "tms:{id1}:{id2}" project_id into its two ids."""
    id1, id2 = project_id[len(TMS_ID_PREFIX) :].split(":", 1)
    return id1, id2

# Keep strong references to fire-and-forget warm-up tasks — otherwise asyncio
# may garbage-collect them mid-flight since nothing else holds them.
_background_tasks: set[asyncio.Task] = set()


def schedule_tms_warmup(image_id: str) -> None:
    """Run a TMS uuid search in the background without making the caller wait.

    Finding a TMS-sourced image (image_id starting with "tms:") requires paging
    through OAM's /meta catalog — too slow to block "add project to plan" on
    (see find_image_by_tms_ids). This kicks off that same search detached from
    the request, purely to warm its page cache, so that the next call to
    fetch_imagery_by_id for this image_id (e.g. on plan hydration, which is
    time-bounded) is likely to find the answer already cached instead of
    repeating the full search.
    """
    task = asyncio.ensure_future(fetch_imagery_by_id(image_id))
    _background_tasks.add(task)

    def _on_done(t: asyncio.Task) -> None:
        _background_tasks.discard(t)
        if not t.cancelled() and t.exception() is not None:
            logger.warning("OAM TMS cache warm-up failed for %s: %s", image_id, t.exception())

    task.add_done_callback(_on_done)


async def _fetch_meta_page(client: httpx.AsyncClient, page: int) -> list[dict]:
    cache_key = f"{_META_PAGE_CACHE_PREFIX}{page}"
    images = get_cached(cache_key)
    if images is not None:
        return images
    params = {"limit": _META_PAGE_SIZE, "page": page, "sort": "desc"}
    response = await client.get(f"{_OAM_PUBLIC_API}/meta", params=params)
    response.raise_for_status()
    images = response.json().get("results") or []
    set_cached(cache_key, images, DEFAULT_TTL)
    return images


def _filter_oam_result(result: dict) -> dict:
    """Keep only the fields callers of fetch_imagery_by_id actually use."""
    return {
        "title": result.get("title"),
        "thumbnail": (result.get("properties") or {}).get("thumbnail"),
        "bbox": result.get("bbox"),
    }


def _match_in_page(images: list[dict], needle: str) -> dict | None:
    result = next((img for img in images if needle in (img.get("uuid") or "")), None)
    return None if result is None else _filter_oam_result(result)


async def _run_batch(
    client: httpx.AsyncClient, pages: list[int], needle: str
) -> tuple[dict | None, bool]:
    """Fetch `pages` concurrently, returning as soon as any of them matches.

    Uses as_completed (not gather) so one slow straggler in the batch can't hold
    up a match that already arrived from a faster sibling — the still-pending
    fetches are cancelled instead of waited on. Returns (match, reached_last_page).
    """
    tasks = [asyncio.ensure_future(_fetch_meta_page(client, p)) for p in pages]
    reached_last_page = False
    try:
        for coro in asyncio.as_completed(tasks):
            images = await coro
            match = _match_in_page(images, needle)
            if match is not None:
                return match, reached_last_page
            if len(images) < _META_PAGE_SIZE:
                reached_last_page = True
    finally:
        for task in tasks:
            if not task.done():
                task.cancel()
    return None, reached_last_page


async def _search_tms_pages(needle: str) -> dict | None:
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Fast path: check page 1 alone first — most TMS lookups are for recently
        # uploaded images, which land on the newest (first) page. Avoids firing a
        # full concurrent batch at OAM when a single request would have been enough.
        page1 = await _fetch_meta_page(client, 1)
        match = _match_in_page(page1, needle)
        if match is not None:
            return match
        if len(page1) < _META_PAGE_SIZE:
            return None  # page 1 was also the last page

        page = 2
        while page <= _META_MAX_PAGES:
            batch_pages = list(range(page, min(page + _META_PAGE_BATCH, _META_MAX_PAGES + 1)))
            match, reached_last_page = await _run_batch(client, batch_pages, needle)
            if match is not None:
                return match
            if reached_last_page:
                break
            page += len(batch_pages)

    return None


async def find_image_by_tms_ids(id1: str, id2: str) -> dict | None:
    """Resolve an OAM image from the two ids in a TMS tile URL.

    The tiles.openaerialmap.org/{id1}/0/{id2}/{z}/{x}/{y} URL does not carry OAM's
    own _id or user_id — id1/id2 are S3 object-path segments (the image's `uuid`
    field is "https://.../{id1}/0/{id2}.tif"). There is no direct /meta/{id} lookup
    for these, so this pages through /meta (newest first) searching for a uuid
    containing both segments, stopping at the first match or the last page.

    OAM's /meta endpoint is slow and variable (measured ~3-11s per 2000-item page,
    occasionally more), so pages are fetched _META_PAGE_BATCH at a time
    (concurrently) rather than one by one, returning as soon as any page in the
    batch matches instead of waiting on the slowest one. The whole search is
    capped at _META_SEARCH_TIMEOUT — a slow/unresponsive OAM is reported as
    UpstreamUnavailable rather than silently hanging or being misreported as
    "not found".

    Deliberately independent of the oam_images DB table/sync scheduler (that table
    backs an unused map feature and may be removed). Each page is cached separately
    so repeated lookups — even for different images — reuse pages already fetched.
    """
    needle = f"/{id1}/0/{id2}"
    try:
        return await asyncio.wait_for(_search_tms_pages(needle), timeout=_META_SEARCH_TIMEOUT)
    except asyncio.TimeoutError as e:
        raise UpstreamUnavailable("open-aerial-map: TMS search timed out") from e
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"open-aerial-map: {e}") from e


async def fetch_imagery_by_id(
    image_id: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Fetch OAM image metadata by id.

    None on 404, raises UpstreamUnavailable on failure.
    Note: this does not consult the local oam_images DB table — hydration of plans
    uses the live API directly so orphan detection works even when local sync is stale.

    image_id may be a compound "{user_id}:{image_id}" (produced by url_resolver for
    /user/ URLs). The user_id is preserved here to resolve file-UUID-based IDs (see
    OAM bug comment below); only image_id is used in the primary /meta/{id} call.

    image_id may also be "tms:{id1}:{id2}" (produced by url_resolver for TMS tile
    URLs), resolved via find_image_by_tms_ids instead — those ids are not
    valid /meta/{id} lookups at all (see that function's docstring).
    """
    if is_tms_project_id(image_id):
        id1, id2 = parse_tms_project_id(image_id)
        return await find_image_by_tms_ids(id1, id2)

    user_id: str | None = None
    if ":" in image_id:
        user_id, image_id = image_id.split(":", 1)
    cache_key = f"oam_image_{image_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    api_base = base_url or _OAM_PUBLIC_API
    url = f"{api_base}/meta/{image_id}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            if response.status_code == 500 and user_id:
                # OAM map URLs use the S3 file UUID, not the MongoDB _id.
                # /meta/{file_uuid} crashes with 500; look up the real record via
                # /user/{user_id} by matching uuid ending in /{file_uuid}.tif.
                user_resp = await client.get(f"{api_base}/user/{user_id}")
                user_resp.raise_for_status()
                images = user_resp.json().get("results", {}).get("images", [])
                suffix = f"/{image_id}.tif"
                result = next(
                    (img for img in images if (img.get("uuid") or "").endswith(suffix)),
                    None,
                )
                if result is None:
                    return None
                filtered = {
                    "title": result.get("title"),
                    "thumbnail": (result.get("properties") or {}).get("thumbnail"),
                    "bbox": result.get("bbox"),
                }
                set_cached(cache_key, filtered, DEFAULT_TTL)
                return filtered
            elif response.status_code == 500:
                return None
            else:
                response.raise_for_status()
                data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"open-aerial-map: {e}") from e

    raw = data.get("results") or []
    if not raw:
        return None
    result = raw if isinstance(raw, dict) else raw[0]
    filtered = {
        "title": result.get("title"),
        "thumbnail": (result.get("properties") or {}).get("thumbnail"),
        "bbox": result.get("bbox"),
    }
    set_cached(cache_key, filtered, DEFAULT_TTL)
    return filtered

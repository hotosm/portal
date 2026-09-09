"""MapSwipe service: reusable fetch-by-id with caching.

MapSwipe has no public single-project API covering both its legacy Firebase
push-id projects and its newer ULID-id projects (its GraphQL endpoint only
lets you filter by `oldId`, which is unset on ULID projects). Instead, the
project page at mapswipe.org is server-rendered by Next.js and embeds the
full project object as JSON in a `__NEXT_DATA__` script tag, and 404s
cleanly when the project doesn't exist — so that page is fetched and parsed
in place of a real API.
"""

import json
import re

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.services.exceptions import UpstreamUnavailable

MAPSWIPE_BASE_URL = "https://mapswipe.org"

_NEXT_DATA_RE = re.compile(
    r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.S
)


def _extract_next_data(html: str) -> dict:
    match = _NEXT_DATA_RE.search(html)
    if not match:
        raise ValueError("__NEXT_DATA__ script tag not found in MapSwipe page")
    return json.loads(match.group(1))["props"]["pageProps"]


def _project_from_next_data(page_props: dict) -> dict | None:
    name = page_props.get("name")
    if not name:
        return None

    image = page_props.get("image") or {}
    image_url = (image.get("file") or {}).get("url")

    return {
        "name": name,
        "description": page_props.get("description"),
        "image_url": image_url,
        "status": page_props.get("status"),
        "progress": page_props.get("progress"),
        "region": page_props.get("region"),
        "number_of_contributors": page_props.get("numberOfContributorUsers"),
    }


async def fetch_project_by_id(
    project_id: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Fetch a MapSwipe project by id. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"mapswipe_project_{project_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    url = f"{base_url or MAPSWIPE_BASE_URL}/en/projects/{project_id}/"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            page_props = _extract_next_data(response.text)
    except (httpx.RequestError, httpx.HTTPStatusError, ValueError) as e:
        raise UpstreamUnavailable(f"mapswipe: {e}") from e

    result = _project_from_next_data(page_props)
    if result is not None:
        set_cached(cache_key, result, DEFAULT_TTL)
    return result

"""Field Tasking Manager (FMTM) service: reusable fetch-by-id with caching."""

import re

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings

_TITLE_RE = re.compile(r"<title>\s*(.+?)\s*-\s*Field Tasking Manager\s*</title>", re.I)


async def fetch_project_by_id(
    project_id: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Fetch a single FMTM project by id by parsing the HTML page title.

    Returns a dict with at least {"name": ..., "id": ...}, None on 404.
    Never raises — returns None on any network or parse failure.
    """
    external_base = base_url or settings.field_tm_base_url or "https://field.hotosm.org"
    fetch_base = (
        settings.field_tm_internal_url
        if settings.field_tm_internal_url and external_base == settings.field_tm_base_url
        else external_base
    )
    cache_key = f"fmtm_project_{external_base}_{project_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    url = f"{fetch_base}/projects/{project_id}"
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            html = response.text
    except Exception:
        return None

    m = _TITLE_RE.search(html)
    data = {"id": int(project_id), "name": m.group(1) if m else f"Project {project_id}", "base_url": external_base}
    set_cached(cache_key, data, DEFAULT_TTL)
    return data

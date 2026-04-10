"""Shared helpers for uMap endpoints (used by both map and user routes)."""

import os
import re

import httpx
from fastapi import HTTPException, Request

from app.core.config import settings

UMAP_BASE_URL = settings.umap_base_url
UMAP_LOCALE = "en"
UMAP_API_BASE_URL = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/datalayer"
UMAP_SHOWCASE_URL = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/showcase/"
UMAP_VERIFY_SSL = os.getenv("UMAP_VERIFY_SSL", "false").lower() == "true"

_MAP_HREF_RE = re.compile(r'href="([^"]*)"', re.IGNORECASE)
_MAP_PATH_RE = re.compile(r"^/(?:[^/]+/)?map/([^/?#]+_(\d+))$")


def _umap_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=30.0, verify=UMAP_VERIFY_SSL, follow_redirects=True)


def _require_hanko(request: Request) -> str:
    cookie = request.cookies.get("hanko")
    if not cookie:
        raise HTTPException(status_code=401, detail="Hanko authentication cookie not found.")
    return cookie


def _parse_map_links(html: str) -> list[dict]:
    """Extract unique map entries from a uMap HTML page.

    Returns a list of dicts with 'id' (str) and 'slug' (str).
    Skips external URLs, query-string variants, and duplicates.
    """
    seen_ids: set[str] = set()
    results: list[dict] = []

    for href in _MAP_HREF_RE.findall(html):
        m = _MAP_PATH_RE.match(href)
        if m:
            slug = m.group(1)
            map_id = m.group(2)
            if map_id not in seen_ids:
                seen_ids.add(map_id)
                results.append({"id": map_id, "slug": slug})

    return results

# portal/backend/app/api/routes/user/umap.py

"""uMap authenticated API endpoints."""

import logging

import httpx
from fastapi import APIRouter, HTTPException, Request

from app.api.routes.shared.umap_helpers import (
    UMAP_BASE_URL,
    UMAP_LOCALE,
    _umap_client,
    _require_hanko,
    _parse_map_links,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/umap")


@router.get("/user/maps")
async def get_user_maps(request: Request) -> dict:
    """Fetch the authenticated user's maps from uMap."""
    hanko_cookie = _require_hanko(request)
    url = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/me"

    try:
        async with _umap_client() as client:
            response = await client.get(url, cookies={"hanko": hanko_cookie})
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error fetching uMap maps: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")

    html = response.text
    if "sesión" in html:
        raise HTTPException(status_code=401, detail="uMap authentication failed.")

    maps = _parse_map_links(html)
    logger.info("[uMap] Found %d maps", len(maps))
    return {"maps": maps}


@router.get("/user/templates")
async def get_user_templates(request: Request) -> dict:
    """Fetch the authenticated user's map templates from uMap."""
    hanko_cookie = _require_hanko(request)
    url = f"{UMAP_BASE_URL}/{UMAP_LOCALE}/me/templates"

    try:
        async with _umap_client() as client:
            response = await client.get(url, cookies={"hanko": hanko_cookie})
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Error fetching uMap templates: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Connection error to uMap: {str(e)}")

    html = response.text
    if "sesión" in html:
        raise HTTPException(status_code=401, detail="uMap authentication failed.")

    templates = _parse_map_links(html)
    logger.info("[uMap] Found %d templates", len(templates))
    return {"templates": templates}

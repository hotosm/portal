"""Drone Tasking Manager service: reusable fetch-by-id with caching."""

import base64
import json
import logging

import httpx

from app.core.cache import DEFAULT_TTL, get_cached, set_cached
from app.core.config import settings
from app.core.http import DEFAULT_TIMEOUT, make_client
from app.services.exceptions import UpstreamUnavailable

logger = logging.getLogger(__name__)

DRONE_TM_BACKEND_URL = settings.drone_tm_api_base_url or settings.drone_tm_api_url


def verify_ssl(base_url: str | None = None) -> bool:
    effective = base_url or DRONE_TM_BACKEND_URL
    return not effective.startswith("https://") or bool(settings.drone_tm_verify_ssl)


def extract_hanko_user_id_from_token(token: str) -> str | None:
    """Decode a JWT-like token (no signature verification) and return a user id.

    Used only to forward an identifier to DroneTM so it can match Portal users to
    its own test instances. Returns None when the token can't be decoded.
    """
    try:
        parts = token.split(".")
        if len(parts) < 2:
            return None
        payload = parts[1]
        padding = "=" * (-len(payload) % 4)  # restore base64 padding
        decoded = base64.urlsafe_b64decode(payload + padding).decode("utf-8")
        data = json.loads(decoded)
        return data.get("sub") or data.get("hanko_user_id") or data.get("user_id")
    except Exception:
        return None


async def fetch_project_by_id(
    project_id: str,
    *,
    base_url: str | None = None,
    force_refresh: bool = False,
) -> dict | None:
    """Fetch a single DroneTM project by id. None on 404, raises UpstreamUnavailable on failure."""
    cache_key = f"dronetm_project_{project_id}"
    if not force_refresh:
        cached = get_cached(cache_key)
        if cached is not None:
            return cached

    url = f"{base_url or DRONE_TM_BACKEND_URL}/projects/{project_id}"
    try:
        async with make_client(timeout=DEFAULT_TIMEOUT, verify=verify_ssl(base_url)) as client:
            response = await client.get(url, headers={"Accept": "application/json"})
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        raise UpstreamUnavailable(f"drone-tasking-manager: {e}") from e

    set_cached(cache_key, data, DEFAULT_TTL)
    return data

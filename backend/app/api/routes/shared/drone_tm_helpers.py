"""Shared helpers for DroneTM endpoints (used by both map and user routes)."""

import base64
import json
import logging
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

DRONE_TM_BACKEND_URL = settings.drone_tm_api_url
DRONE_TM_AUTH_HEADER = settings.drone_tm_auth_header
DRONE_TM_AUTH_PREFIX = settings.drone_tm_auth_prefix


def build_dronetm_cache_key(
    filter_by_owner: bool,
    search: str | None,
    page: int,
    results_per_page: int,
) -> str:
    """Build the cache key for DroneTM centroids. Single source of truth."""
    return f"dronetm_centroids_{filter_by_owner}_{search}_{page}_{results_per_page}"


def _extract_hanko_user_id_from_token(token: str) -> Optional[str]:
    """Try to decode a JWT-like token and extract a user id (sub or hanko_user_id).

    This does a unsigned decode (no verification) and is only used to pass an
    identifier upstream for matching Portal users to DroneTM test instances.
    """
    try:
        parts = token.split('.')
        if len(parts) < 2:
            return None
        payload = parts[1]
        # Fix padding
        padding = '=' * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload + padding).decode('utf-8')
        data = json.loads(decoded)
        return data.get('sub') or data.get('hanko_user_id') or data.get('user_id')
    except Exception:
        return None

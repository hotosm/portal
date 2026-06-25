# portal/backend/app/core/cache.py

"""Simple in-memory cache with TTL support for API responses.

Access is guarded by a lock so the store stays consistent even if touched
from a worker thread (e.g. a sync path operation run in the threadpool),
not just from the async event loop.
"""

import threading
import time
from typing import Any

# Global cache storage, guarded by _lock.
_cache: dict[str, dict[str, Any]] = {}
_lock = threading.Lock()

# Default TTL values (in seconds)
DEFAULT_TTL = 5 * 60  # 5 minutes
SHORT_TTL = 60  # 1 minute
LONG_TTL = 15 * 60  # 15 minutes


def get_cached(key: str) -> Any | None:
    """Return the cached value for ``key``, or None if missing or expired."""
    with _lock:
        entry = _cache.get(key)
        if entry is None:
            return None
        if time.time() < entry["expires_at"]:
            return entry["data"]
        del _cache[key]
        return None


def set_cached(key: str, data: Any, ttl: int = DEFAULT_TTL) -> None:
    """Store ``data`` under ``key`` with a TTL in seconds."""
    with _lock:
        _cache[key] = {
            "data": data,
            "expires_at": time.time() + ttl,
        }


def delete_cached(key: str) -> bool:
    """Delete a specific cache entry. Returns True if it existed."""
    with _lock:
        return _cache.pop(key, None) is not None


def clear_cache() -> int:
    """Clear all cache entries. Returns the number of entries removed."""
    with _lock:
        count = len(_cache)
        _cache.clear()
        return count

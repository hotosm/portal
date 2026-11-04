# portal/backend/app/core/cache.py

"""Simple in-memory cache with TTL support for API responses."""

import time
import hashlib
import json
from typing import Any, Optional
from functools import wraps

# Global cache storage
_cache: dict[str, dict[str, Any]] = {}

# Default TTL values (in seconds)
DEFAULT_TTL = 5 * 60  # 5 minutes
SHORT_TTL = 60  # 1 minute
LONG_TTL = 15 * 60  # 15 minutes


def get_cached(key: str) -> Optional[Any]:
    """Get cached value if not expired."""
    if key in _cache:
        entry = _cache[key]
        if time.time() < entry["expires_at"]:
            return entry["data"]
        del _cache[key]
    return None


def set_cached(key: str, data: Any, ttl: int = DEFAULT_TTL) -> None:
    """Set cache with TTL."""
    _cache[key] = {
        "data": data,
        "expires_at": time.time() + ttl,
    }


def delete_cached(key: str) -> bool:
    """Delete a specific cache entry. Returns True if deleted."""
    if key in _cache:
        del _cache[key]
        return True
    return False


def clear_cache() -> int:
    """Clear all cache entries. Returns number of entries cleared."""
    count = len(_cache)
    _cache.clear()
    return count


def cache_key(*args, **kwargs) -> str:
    """Generate a cache key from arguments."""
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    return hashlib.md5(key_data.encode()).hexdigest()


def cached(ttl: int = DEFAULT_TTL, key_prefix: str = ""):
    """
    Decorator for caching async function results.

    Usage:
        @cached(ttl=300, key_prefix="my_endpoint")
        async def my_endpoint(param1, param2):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            full_key = f"{key_prefix}:{cache_key(*args, **kwargs)}" if key_prefix else cache_key(*args, **kwargs)

            # Check cache
            cached_data = get_cached(full_key)
            if cached_data is not None:
                return cached_data

            # Call function
            result = await func(*args, **kwargs)

            # Cache result
            set_cached(full_key, result, ttl)

            return result
        return wrapper
    return decorator


def get_cache_stats() -> dict:
    """Get cache statistics."""
    now = time.time()
    total = len(_cache)
    expired = sum(1 for entry in _cache.values() if now >= entry["expires_at"])
    return {
        "total_entries": total,
        "expired_entries": expired,
        "active_entries": total - expired,
    }
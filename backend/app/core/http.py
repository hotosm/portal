"""Shared construction of outbound HTTP clients.

Centralizes timeout values and connection-pool defaults so every outbound
``httpx`` client is built the same way. The client is still constructed via
``httpx.AsyncClient`` at call time, so existing tests that patch
``httpx.AsyncClient`` keep intercepting it.
"""

import httpx

# Semantic timeouts (seconds) for outbound calls to upstream services.
QUICK_TIMEOUT = 10.0    # lightweight / user-facing single fetches
SHORT_TIMEOUT = 15.0    # HTML scrapes that follow redirects (FMTM)
DEFAULT_TIMEOUT = 30.0  # standard upstream API request
SLOW_TIMEOUT = 60.0     # heavier aggregations
SYNC_TIMEOUT = 90.0     # background DB sync fan-out
BULK_TIMEOUT = 120.0    # full paginated crawls

# Shared connection-pool limits reused across the short-lived clients.
_LIMITS = httpx.Limits(max_connections=100, max_keepalive_connections=20)


def make_client(
    *,
    timeout: float = DEFAULT_TIMEOUT,
    verify: bool = True,
    follow_redirects: bool = False,
    **kwargs,
) -> httpx.AsyncClient:
    """Build an ``httpx.AsyncClient`` with shared defaults.

    Thin factory (constructs at call time) so test mocks that patch
    ``httpx.AsyncClient`` continue to work. Extra keyword arguments
    (e.g. ``cookies``, ``headers``) are forwarded unchanged.
    """
    return httpx.AsyncClient(
        timeout=timeout,
        verify=verify,
        follow_redirects=follow_redirects,
        limits=_LIMITS,
        **kwargs,
    )

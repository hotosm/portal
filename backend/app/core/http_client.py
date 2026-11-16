"""Shared httpx clients so upstream calls reuse pooled TCP/TLS connections."""

import httpx

_clients: dict[bool, httpx.AsyncClient] = {}

_TIMEOUT = httpx.Timeout(30.0, connect=5.0)
_LIMITS = httpx.Limits(max_connections=100, max_keepalive_connections=20)


def get_http_client(verify: bool = True) -> httpx.AsyncClient:
    """Return the shared client for the given TLS verification setting."""
    client = _clients.get(verify)
    if client is None or client.is_closed:
        client = httpx.AsyncClient(timeout=_TIMEOUT, limits=_LIMITS, verify=verify)
        _clients[verify] = client
    return client


async def close_http_clients() -> None:
    """Close all shared clients (called on application shutdown)."""
    for client in _clients.values():
        await client.aclose()
    _clients.clear()

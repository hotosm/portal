"""Shared exceptions for services that wrap external upstream APIs."""


class UpstreamUnavailable(Exception):
    """Raised when an upstream service is unreachable, timing out, or returning 5xx."""

"""
Custom exceptions for hotosm-auth library.
"""


class AuthenticationError(Exception):
    """Base exception for authentication errors."""

    pass


class TokenExpiredError(AuthenticationError):
    """JWT token has expired."""

    pass


class TokenInvalidError(AuthenticationError):
    """JWT token is invalid or malformed."""

    pass


class CookieDecryptionError(AuthenticationError):
    """Failed to decrypt cookie data."""

    pass


class OSMOAuthError(Exception):
    """OSM OAuth flow error."""

    pass


class OSMAPIError(Exception):
    """OSM API request error."""

    pass

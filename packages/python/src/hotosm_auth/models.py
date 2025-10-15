"""
Data models for HOTOSM authentication.

These are simple dataclasses, not database models. They represent:
- HankoUser: Authenticated user from Hanko JWT
- OSMConnection: OSM OAuth token data from httpOnly cookie
- OSMScope: Available OSM OAuth scopes
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class OSMScope(str, Enum):
    """OpenStreetMap OAuth 2.0 scopes.

    See: https://wiki.openstreetmap.org/wiki/OAuth#OAuth_2.0_2
    """

    READ_PREFS = "read_prefs"
    WRITE_PREFS = "write_prefs"
    WRITE_DIARY = "write_diary"
    WRITE_API = "write_api"
    READ_GPX = "read_gpx"
    WRITE_GPX = "write_gpx"
    WRITE_NOTES = "write_notes"


@dataclass
class HankoUser:
    """User authenticated via Hanko.

    This data comes from the validated Hanko JWT token.
    The `id` is a UUID that uniquely identifies the user across all HOTOSM apps.

    For apps with existing users, use legacy mapping tables to link
    `hanko_user.id` to your existing user IDs.
    """

    id: str  # Hanko UUID (e.g., "550e8400-e29b-41d4-a716-446655440000")
    email: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    # Optional fields
    username: Optional[str] = None

    @property
    def display_name(self) -> str:
        """Best available display name for the user."""
        return self.username or self.email.split("@")[0]


@dataclass
class OSMConnection:
    """OpenStreetMap OAuth connection data.

    This data comes from the encrypted httpOnly cookie set after OSM OAuth.
    The cookie is encrypted server-side and decrypted on each request.

    IMPORTANT: This is NOT stored in a database table. It only exists
    in the user's browser cookie and is decrypted per-request.
    """

    osm_user_id: int  # OSM numeric user ID
    osm_username: str  # OSM username (display name)
    osm_avatar_url: Optional[str]  # Profile image URL
    access_token: str  # OAuth access token (decrypted, ready to use)
    refresh_token: Optional[str] = None  # OAuth refresh token
    expires_at: Optional[datetime] = None  # Token expiration
    scopes: list[str] = None  # Granted scopes

    def __post_init__(self) -> None:
        """Initialize default values."""
        if self.scopes is None:
            self.scopes = []

    @property
    def is_expired(self) -> bool:
        """Check if the access token has expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

    def has_scope(self, scope: OSMScope | str) -> bool:
        """Check if this connection has a specific scope."""
        scope_str = scope.value if isinstance(scope, OSMScope) else scope
        return scope_str in self.scopes

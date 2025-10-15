"""
Tests for data models.
"""

from datetime import datetime, timedelta
import pytest

from hotosm_auth.models import HankoUser, OSMConnection, OSMScope


def test_hanko_user_creation():
    """Test HankoUser dataclass creation."""
    user = HankoUser(
        id="550e8400-e29b-41d4-a716-446655440000",
        email="test@example.com",
        email_verified=True,
        username="testuser",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    assert user.id == "550e8400-e29b-41d4-a716-446655440000"
    assert user.email == "test@example.com"
    assert user.username == "testuser"
    assert user.email_verified is True


def test_hanko_user_display_name():
    """Test display name property."""
    # With username
    user = HankoUser(
        id="123",
        email="test@example.com",
        email_verified=True,
        username="testuser",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    assert user.display_name == "testuser"

    # Without username (fallback to email prefix)
    user_no_username = HankoUser(
        id="123",
        email="test@example.com",
        email_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    assert user_no_username.display_name == "test"


def test_osm_connection_creation():
    """Test OSMConnection dataclass creation."""
    expires = datetime.utcnow() + timedelta(days=30)
    conn = OSMConnection(
        osm_user_id=123456,
        osm_username="testuser",
        osm_avatar_url="https://example.com/avatar.jpg",
        access_token="test_token",
        refresh_token="refresh_token",
        expires_at=expires,
        scopes=["read_prefs", "write_api"],
    )

    assert conn.osm_user_id == 123456
    assert conn.osm_username == "testuser"
    assert conn.access_token == "test_token"
    assert len(conn.scopes) == 2


def test_osm_connection_is_expired():
    """Test token expiration check."""
    # Not expired
    future = datetime.utcnow() + timedelta(days=1)
    conn = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
        expires_at=future,
    )
    assert conn.is_expired is False

    # Expired
    past = datetime.utcnow() - timedelta(days=1)
    expired_conn = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
        expires_at=past,
    )
    assert expired_conn.is_expired is True

    # No expiration set (never expires)
    no_expiry = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
    )
    assert no_expiry.is_expired is False


def test_osm_connection_has_scope():
    """Test scope checking."""
    conn = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
        scopes=["read_prefs", "write_api"],
    )

    # String scope
    assert conn.has_scope("read_prefs") is True
    assert conn.has_scope("write_diary") is False

    # Enum scope
    assert conn.has_scope(OSMScope.READ_PREFS) is True
    assert conn.has_scope(OSMScope.WRITE_DIARY) is False


def test_osm_scope_enum():
    """Test OSMScope enum values."""
    assert OSMScope.READ_PREFS.value == "read_prefs"
    assert OSMScope.WRITE_API.value == "write_api"
    assert OSMScope.WRITE_GPX.value == "write_gpx"

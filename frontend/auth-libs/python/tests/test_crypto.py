"""
Tests for cookie encryption/decryption.
"""

from datetime import datetime, timedelta
import pytest

from hotosm_auth.crypto import CookieCrypto, generate_cookie_secret
from hotosm_auth.models import OSMConnection
from hotosm_auth.exceptions import CookieDecryptionError


def test_generate_secret():
    """Test secret generation."""
    secret = generate_cookie_secret()
    assert len(secret) >= 32
    assert isinstance(secret, str)


def test_crypto_init_with_short_secret():
    """Test that short secrets are rejected."""
    with pytest.raises(ValueError, match="at least 32 bytes"):
        CookieCrypto("too-short")


def test_encrypt_decrypt_osm_connection():
    """Test round-trip encryption/decryption."""
    secret = generate_cookie_secret()
    crypto = CookieCrypto(secret)

    expires = datetime.utcnow() + timedelta(days=30)
    original = OSMConnection(
        osm_user_id=123456,
        osm_username="testuser",
        osm_avatar_url="https://example.com/avatar.jpg",
        access_token="test_access_token",
        refresh_token="test_refresh_token",
        expires_at=expires,
        scopes=["read_prefs", "write_api"],
    )

    # Encrypt
    encrypted = crypto.encrypt_osm_connection(original)
    assert isinstance(encrypted, str)
    assert len(encrypted) > 0

    # Decrypt
    decrypted = crypto.decrypt_osm_connection(encrypted)
    assert decrypted.osm_user_id == original.osm_user_id
    assert decrypted.osm_username == original.osm_username
    assert decrypted.access_token == original.access_token
    assert decrypted.refresh_token == original.refresh_token
    assert len(decrypted.scopes) == 2


def test_encrypt_decrypt_minimal_connection():
    """Test with minimal OSMConnection (only required fields)."""
    secret = generate_cookie_secret()
    crypto = CookieCrypto(secret)

    original = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
    )

    encrypted = crypto.encrypt_osm_connection(original)
    decrypted = crypto.decrypt_osm_connection(encrypted)

    assert decrypted.osm_user_id == 123
    assert decrypted.osm_username == "test"
    assert decrypted.osm_avatar_url is None
    assert decrypted.access_token == "token"
    assert decrypted.refresh_token is None
    assert decrypted.expires_at is None
    assert decrypted.scopes == []


def test_decrypt_with_wrong_secret():
    """Test that decryption fails with wrong secret."""
    secret1 = generate_cookie_secret()
    secret2 = generate_cookie_secret()

    crypto1 = CookieCrypto(secret1)
    crypto2 = CookieCrypto(secret2)

    conn = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
    )

    encrypted = crypto1.encrypt_osm_connection(conn)

    with pytest.raises(CookieDecryptionError, match="Invalid or tampered cookie"):
        crypto2.decrypt_osm_connection(encrypted)


def test_decrypt_invalid_data():
    """Test decryption with invalid/corrupted data."""
    secret = generate_cookie_secret()
    crypto = CookieCrypto(secret)

    with pytest.raises(CookieDecryptionError):
        crypto.decrypt_osm_connection("invalid_encrypted_data")


def test_decrypt_tampered_data():
    """Test decryption with tampered data."""
    secret = generate_cookie_secret()
    crypto = CookieCrypto(secret)

    conn = OSMConnection(
        osm_user_id=123,
        osm_username="test",
        osm_avatar_url=None,
        access_token="token",
    )

    encrypted = crypto.encrypt_osm_connection(conn)

    # Tamper with the encrypted data
    tampered = encrypted[:-10] + "XXXXXXXXXX"

    with pytest.raises(CookieDecryptionError):
        crypto.decrypt_osm_connection(tampered)

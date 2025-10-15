"""
Encryption/decryption for httpOnly cookies.

Uses Fernet (symmetric encryption) to encrypt OSM OAuth tokens before
storing them in httpOnly cookies. This prevents XSS attacks from stealing tokens.
"""

import json
import base64
from typing import Optional
from datetime import datetime

from cryptography.fernet import Fernet, InvalidToken

from hotosm_auth.models import OSMConnection
from hotosm_auth.exceptions import CookieDecryptionError


class CookieCrypto:
    """Handles encryption/decryption of OSM connection data in cookies.

    Uses Fernet (symmetric encryption with AES-128-CBC + HMAC).
    The cookie_secret must be at least 32 bytes and will be used to
    derive a Fernet key.

    Example:
        crypto = CookieCrypto("my-secret-key-min-32-bytes-long")
        encrypted = crypto.encrypt_osm_connection(osm_conn)
        osm_conn = crypto.decrypt_osm_connection(encrypted)
    """

    def __init__(self, secret: str):
        """Initialize crypto handler.

        Args:
            secret: Secret key (min 32 bytes)

        Raises:
            ValueError: If secret is too short
        """
        if len(secret) < 32:
            raise ValueError("Cookie secret must be at least 32 bytes")

        # Derive Fernet key from secret
        # Fernet requires exactly 32 url-safe base64-encoded bytes
        key_bytes = secret.encode()[:32].ljust(32, b"\0")
        self._fernet_key = base64.urlsafe_b64encode(key_bytes)
        self._fernet = Fernet(self._fernet_key)

    def encrypt_osm_connection(self, conn: OSMConnection) -> str:
        """Encrypt OSM connection data for cookie storage.

        Args:
            conn: OSM connection data

        Returns:
            str: Encrypted cookie value (base64 encoded)
        """
        # Serialize to JSON
        data = {
            "osm_user_id": conn.osm_user_id,
            "osm_username": conn.osm_username,
            "osm_avatar_url": conn.osm_avatar_url,
            "access_token": conn.access_token,
            "refresh_token": conn.refresh_token,
            "expires_at": conn.expires_at.isoformat() if conn.expires_at else None,
            "scopes": conn.scopes,
        }
        json_str = json.dumps(data)

        # Encrypt
        encrypted_bytes = self._fernet.encrypt(json_str.encode())

        # Return base64 string (safe for cookies)
        return encrypted_bytes.decode()

    def decrypt_osm_connection(self, encrypted_value: str) -> OSMConnection:
        """Decrypt OSM connection data from cookie.

        Args:
            encrypted_value: Encrypted cookie value

        Returns:
            OSMConnection: Decrypted connection data

        Raises:
            CookieDecryptionError: If decryption fails or data is invalid
        """
        try:
            # Decrypt
            encrypted_bytes = encrypted_value.encode()
            decrypted_bytes = self._fernet.decrypt(encrypted_bytes)
            json_str = decrypted_bytes.decode()

            # Parse JSON
            data = json.loads(json_str)

            # Parse expires_at if present
            expires_at = None
            if data.get("expires_at"):
                expires_at = datetime.fromisoformat(data["expires_at"])

            # Reconstruct OSMConnection
            return OSMConnection(
                osm_user_id=data["osm_user_id"],
                osm_username=data["osm_username"],
                osm_avatar_url=data.get("osm_avatar_url"),
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_at=expires_at,
                scopes=data.get("scopes", []),
            )

        except InvalidToken as e:
            raise CookieDecryptionError("Invalid or tampered cookie") from e
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            raise CookieDecryptionError(f"Malformed cookie data: {str(e)}") from e


def generate_cookie_secret() -> str:
    """Generate a secure random cookie secret (utility function).

    Returns:
        str: 32-byte base64-encoded secret suitable for AuthConfig

    Example:
        secret = generate_cookie_secret()
        config = AuthConfig(cookie_secret=secret, ...)
    """
    return Fernet.generate_key().decode()

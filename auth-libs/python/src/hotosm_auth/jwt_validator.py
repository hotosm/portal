"""
JWT validation with JWKS (JSON Web Key Set).

Validates Hanko JWT tokens using public keys from the JWKS endpoint.
Implements caching to avoid fetching keys on every request.
"""

import time
from typing import Optional
from datetime import datetime, timedelta

import jwt
import httpx
from jwt import PyJWKClient

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser
from hotosm_auth.exceptions import (
    AuthenticationError,
    TokenExpiredError,
    TokenInvalidError,
)


class JWTValidator:
    """Validates Hanko JWT tokens using JWKS.

    This class:
    1. Fetches public keys from Hanko's JWKS endpoint
    2. Caches keys for performance (default 1 hour TTL)
    3. Validates JWT signatures and claims
    4. Returns HankoUser dataclass on success

    Example:
        validator = JWTValidator(config)
        user = await validator.validate_token(token)
    """

    def __init__(self, config: AuthConfig):
        """Initialize JWT validator.

        Args:
            config: Authentication configuration
        """
        self.config = config
        # Strip trailing slash from HttpUrl (Pydantic adds it automatically)
        base_url = str(config.hanko_api_url).rstrip('/')
        self.jwks_url = f"{base_url}/.well-known/jwks.json"

        # For localhost with self-signed certs, disable SSL verification
        import ssl
        import urllib.request

        if 'localhost' in self.jwks_url or '127.0.0.1' in self.jwks_url:
            # Create an SSL context that doesn't verify certificates
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE

            # Create a custom opener with the unverified SSL context
            https_handler = urllib.request.HTTPSHandler(context=ssl_context)
            opener = urllib.request.build_opener(https_handler)
            urllib.request.install_opener(opener)

        # Initialize PyJWKClient with caching
        self._jwk_client = PyJWKClient(
            self.jwks_url,
            cache_keys=True,
            max_cached_keys=16,
            cache_jwk_set=True,
            lifespan=config.jwks_cache_ttl,
        )

    async def validate_token(self, token: str) -> HankoUser:
        """Validate a JWT token and return the authenticated user.

        Args:
            token: JWT token string from cookie or Authorization header

        Returns:
            HankoUser: Authenticated user data

        Raises:
            TokenExpiredError: Token has expired
            TokenInvalidError: Token signature or claims invalid
            AuthenticationError: Other authentication errors
        """
        try:
            # Get signing key from JWKS
            signing_key = self._jwk_client.get_signing_key_from_jwt(token)

            # Decode and validate JWT
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=self.config.jwt_audience,
                issuer=self.config.jwt_issuer,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_aud": True if self.config.jwt_audience else False,
                    "verify_iss": True if self.config.jwt_issuer else False,
                },
            )

            # Extract user data from JWT payload
            return self._payload_to_user(payload)

        except jwt.ExpiredSignatureError as e:
            raise TokenExpiredError("JWT token has expired") from e
        except jwt.InvalidTokenError as e:
            raise TokenInvalidError(f"Invalid JWT token: {str(e)}") from e
        except Exception as e:
            raise AuthenticationError(f"Authentication failed: {str(e)}") from e

    def _payload_to_user(self, payload: dict) -> HankoUser:
        """Convert JWT payload to HankoUser dataclass.

        Args:
            payload: Decoded JWT payload

        Returns:
            HankoUser: User data from token

        Raises:
            TokenInvalidError: Required claims missing
        """
        # Hanko JWT standard claims
        # See: https://docs.hanko.io/jwtformat
        try:
            user_id = payload.get("sub")
            email_claim = payload.get("email")

            # Handle email as object or string
            # Hanko can send email as {"address": "...", "is_verified": bool} or just "email@example.com"
            if isinstance(email_claim, dict):
                email = email_claim.get("address")
                email_verified = email_claim.get("is_verified", False)
            else:
                email = email_claim
                email_verified = payload.get("email_verified", False)

            if not user_id or not email:
                raise TokenInvalidError("JWT missing required claims (sub, email)")

            # Parse timestamps
            created_at = self._parse_timestamp(payload.get("iat"))
            updated_at = self._parse_timestamp(payload.get("updated_at", payload.get("iat")))

            return HankoUser(
                id=user_id,
                email=email,
                email_verified=email_verified,
                username=payload.get("username"),
                created_at=created_at,
                updated_at=updated_at,
            )
        except KeyError as e:
            raise TokenInvalidError(f"JWT payload malformed: {str(e)}") from e

    @staticmethod
    def _parse_timestamp(ts: Optional[int | float]) -> datetime:
        """Parse Unix timestamp to datetime.

        Args:
            ts: Unix timestamp (seconds since epoch)

        Returns:
            datetime: Parsed timestamp or current time if None
        """
        if ts is None:
            return datetime.utcnow()
        return datetime.utcfromtimestamp(ts)


async def get_jwks_info(config: AuthConfig) -> dict:
    """Fetch JWKS information from Hanko (utility function for debugging).

    Args:
        config: Authentication configuration

    Returns:
        dict: JWKS data with public keys
    """
    # Strip trailing slash from HttpUrl (Pydantic adds it automatically)
    base_url = str(config.hanko_api_url).rstrip('/')
    jwks_url = f"{base_url}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        return response.json()

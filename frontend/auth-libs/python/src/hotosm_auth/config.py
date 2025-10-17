"""
Configuration for HOTOSM authentication.

Apps should create one AuthConfig instance at startup with their settings.
"""

import os
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl
from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


class AuthConfig(BaseModel):
    """Configuration for hotosm-auth library.

    Example usage:
        config = AuthConfig(
            hanko_api_url="https://login.hotosm.org",
            cookie_secret="your-secret-key-32-bytes-min",
            cookie_domain=".hotosm.org",
            osm_enabled=True,
        )
    """

    # Hanko configuration
    hanko_api_url: HttpUrl = Field(
        ...,
        description="Hanko API URL (e.g., https://login.hotosm.org)",
    )

    # Cookie configuration
    cookie_secret: str = Field(
        ...,
        min_length=32,
        description="Secret key for encrypting OSM cookies (min 32 bytes)",
    )
    cookie_domain: Optional[str] = Field(
        None,
        description="Domain for cookies (e.g., '.hotosm.org' for all subdomains)",
    )
    cookie_secure: bool = Field(
        True,
        description="Use secure cookies (HTTPS only). Set False for local dev.",
    )
    cookie_samesite: str = Field(
        "lax",
        description="SameSite cookie policy: 'lax', 'strict', or 'none'",
    )

    # OSM OAuth configuration
    osm_enabled: bool = Field(
        False,
        description="Enable OSM OAuth integration",
    )
    osm_client_id: Optional[str] = Field(
        None,
        description="OSM OAuth client ID (required if osm_enabled=True)",
    )
    osm_client_secret: Optional[str] = Field(
        None,
        description="OSM OAuth client secret (required if osm_enabled=True)",
    )
    osm_redirect_uri: Optional[str] = Field(
        None,
        description="OSM OAuth redirect URI (e.g., https://app.hotosm.org/auth/osm/callback)",
    )
    osm_scopes: list[str] = Field(
        default_factory=lambda: ["read_prefs"],
        description="Default OSM OAuth scopes to request",
    )
    osm_api_url: HttpUrl = Field(
        default="https://www.openstreetmap.org",
        description="OSM API base URL (use https://master.apis.dev.openstreetmap.org for dev)",
    )

    # JWT validation
    jwt_audience: Optional[str] = Field(
        None,
        description="Expected JWT audience claim (optional)",
    )
    jwt_issuer: Optional[str] = Field(
        "auto",
        description="Expected JWT issuer claim (optional, 'auto' defaults to hanko_api_url, None skips validation)",
    )

    # JWKS caching
    jwks_cache_ttl: int = Field(
        3600,
        description="JWKS cache TTL in seconds (default 1 hour)",
    )

    def model_post_init(self, __context) -> None:
        """Validate configuration after initialization."""
        # If OSM is enabled, require client credentials
        if self.osm_enabled:
            if not self.osm_client_id:
                raise ValueError("osm_client_id is required when osm_enabled=True")
            if not self.osm_client_secret:
                raise ValueError("osm_client_secret is required when osm_enabled=True")

            # Auto-generate osm_redirect_uri if not provided
            if not self.osm_redirect_uri:
                # Default pattern: {HANKO_API_URL}/auth/osm/callback
                auto_uri = f"{str(self.hanko_api_url).rstrip('/')}/auth/osm/callback"
                logger.info(f"OSM_REDIRECT_URI not set, auto-generating: {auto_uri}")
                logger.info("If this doesn't match your app's path, set OSM_REDIRECT_URI explicitly.")
                object.__setattr__(self, 'osm_redirect_uri', auto_uri)

        # Default JWT issuer to Hanko API URL if set to "auto"
        # Use object.__setattr__ because model is frozen
        if self.jwt_issuer == "auto":
            # Strip trailing slash from HttpUrl (Pydantic adds it automatically)
            issuer_url = str(self.hanko_api_url).rstrip('/')
            object.__setattr__(self, 'jwt_issuer', issuer_url)
            print(f"✓ JWT issuer set to: {issuer_url} (from hanko_api_url)")
        elif self.jwt_issuer:
            print(f"✓ JWT issuer explicitly set to: {self.jwt_issuer}")
        else:
            print("⚠️  JWT issuer validation is DISABLED (jwt_issuer=None)")
        # If None, issuer validation is skipped

    @classmethod
    def from_env(cls) -> "AuthConfig":
        """
        Load configuration from environment variables.

        This is the recommended way to configure hotosm-auth in production.

        Required environment variables:
            HANKO_API_URL: Hanko API URL (e.g., https://login.hotosm.org)
            COOKIE_SECRET: Secret key for encrypting cookies (min 32 bytes)

        Optional environment variables:
            COOKIE_DOMAIN: Cookie domain (e.g., ".hotosm.org")
            COOKIE_SECURE: Use secure cookies (default: "true")
            COOKIE_SAMESITE: SameSite policy (default: "lax")
            JWT_AUDIENCE: Expected JWT audience
            JWT_ISSUER: Expected JWT issuer (default: "auto")
            OSM_CLIENT_ID: OSM OAuth client ID
            OSM_CLIENT_SECRET: OSM OAuth client secret
            OSM_REDIRECT_URI: OSM OAuth redirect URI (optional, auto-generated from HANKO_API_URL if not set)
            OSM_SCOPES: Space-separated OSM scopes (default: "read_prefs")
            OSM_API_URL: OSM API URL (default: https://www.openstreetmap.org)

        Example:
            # .env file
            HANKO_API_URL=https://login.hotosm.org
            COOKIE_SECRET=your-secret-key-min-32-bytes
            OSM_CLIENT_ID=your-osm-client-id
            OSM_CLIENT_SECRET=your-osm-client-secret

            # Python code
            config = AuthConfig.from_env()

        Returns:
            AuthConfig: Configuration loaded from environment

        Raises:
            ValueError: If required environment variables are missing
        """
        # Try to load .env file from current working directory
        try:
            from dotenv import load_dotenv
            import os as _os
            # Load from current directory and walk up parent directories
            load_dotenv(dotenv_path=_os.path.join(_os.getcwd(), '.env'), verbose=False)
            # Also try parent directories
            load_dotenv(verbose=False)
        except ImportError:
            # dotenv not installed, rely on environment variables being set
            pass

        # Required variables
        hanko_api_url = os.getenv("HANKO_API_URL")
        if not hanko_api_url:
            raise ValueError(
                "HANKO_API_URL environment variable is required. "
                "Set it to your Hanko API URL (e.g., https://login.hotosm.org)"
            )

        cookie_secret = os.getenv("COOKIE_SECRET")
        if not cookie_secret:
            raise ValueError(
                "COOKIE_SECRET environment variable is required. "
                "Generate a secure secret with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
            )

        # Optional variables with smart defaults
        cookie_domain = os.getenv("COOKIE_DOMAIN")
        cookie_secure_env = os.getenv("COOKIE_SECURE")
        cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax")

        # Smart default for COOKIE_DOMAIN (based on HANKO_API_URL)
        if not cookie_domain:
            from urllib.parse import urlparse
            parsed = urlparse(hanko_api_url)
            hostname = parsed.hostname or "localhost"

            if hostname in ["localhost", "127.0.0.1"]:
                cookie_domain = "localhost"
                logger.info("COOKIE_DOMAIN not set, auto-detected: localhost")
            else:
                # Production: extract root domain with dot prefix
                # e.g., "login.hotosm.org" → ".hotosm.org"
                parts = hostname.split(".")
                if len(parts) >= 2:
                    cookie_domain = f".{'.'.join(parts[-2:])}"
                    logger.info(f"COOKIE_DOMAIN not set, auto-detected: {cookie_domain}")
                else:
                    cookie_domain = None  # No domain restriction
                    logger.info("COOKIE_DOMAIN not set, using no domain restriction")

        # Smart default for COOKIE_SECURE (based on HANKO_API_URL scheme)
        if cookie_secure_env is None:
            cookie_secure = hanko_api_url.startswith("https://")
            logger.info(f"COOKIE_SECURE not set, auto-detected: {cookie_secure} (from {hanko_api_url})")
        else:
            cookie_secure = cookie_secure_env.lower() == "true"

        # JWT configuration
        jwt_audience = os.getenv("JWT_AUDIENCE") or None
        # If JWT_ISSUER is not set or empty, default to "auto"
        # This ensures issuer validation is enabled by default
        jwt_issuer_env = os.getenv("JWT_ISSUER")
        if jwt_issuer_env and jwt_issuer_env.strip():
            jwt_issuer = jwt_issuer_env
            logger.info(f"JWT_ISSUER from env: {jwt_issuer}")
        else:
            jwt_issuer = "auto"  # Default to auto instead of None
            logger.info("JWT_ISSUER not set, defaulting to 'auto'")

        # OSM configuration
        osm_client_id = os.getenv("OSM_CLIENT_ID")
        osm_client_secret = os.getenv("OSM_CLIENT_SECRET")
        osm_redirect_uri = os.getenv("OSM_REDIRECT_URI")
        osm_scopes_str = os.getenv("OSM_SCOPES", "read_prefs")
        osm_scopes = osm_scopes_str.split() if osm_scopes_str else ["read_prefs"]
        osm_api_url = os.getenv("OSM_API_URL", "https://www.openstreetmap.org")

        # Determine if OSM is enabled
        osm_enabled = bool(osm_client_id and osm_client_secret)

        return cls(
            hanko_api_url=hanko_api_url,
            cookie_secret=cookie_secret,
            cookie_domain=cookie_domain,
            cookie_secure=cookie_secure,
            cookie_samesite=cookie_samesite,
            jwt_audience=jwt_audience,
            jwt_issuer=jwt_issuer,
            osm_enabled=osm_enabled,
            osm_client_id=osm_client_id if osm_enabled else None,
            osm_client_secret=osm_client_secret if osm_enabled else None,
            osm_redirect_uri=osm_redirect_uri if osm_enabled else None,
            osm_scopes=osm_scopes if osm_enabled else [],
            osm_api_url=osm_api_url,
        )

    class Config:
        """Pydantic configuration."""
        frozen = True  # Make config immutable after creation

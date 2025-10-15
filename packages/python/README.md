# hotosm-auth

Python library for HOTOSM SSO authentication using Hanko + OpenStreetMap OAuth.

## Features

- **Hanko v2.1.0 Integration**: JWT validation with JWKS for SSO (Google, GitHub, Email/Password)
- **OSM OAuth 2.0**: Optional/required OpenStreetMap authorization
- **httpOnly Cookies**: Secure token storage (no database table needed)
- **Framework Support**: FastAPI and Django integrations
- **Legacy Migration**: User mapping tables for gradual migration from existing auth
- **Type Safe**: Full type hints and Pydantic validation

## Installation

```bash
# Basic installation
pip install hotosm-auth

# With FastAPI support
pip install hotosm-auth[fastapi]

# With Django support
pip install hotosm-auth[django]

# Development
pip install hotosm-auth[dev]
```

## Quick Start

### 1. Configuration (Simplified!)

Create a `.env` file with minimal configuration:

```bash
# Required
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-secret-key-min-32-bytes-long

# Optional - for OSM integration
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret

# ✨ Everything else is auto-detected!
# - COOKIE_DOMAIN: from HANKO_API_URL → ".hotosm.org"
# - COOKIE_SECURE: from HANKO_API_URL scheme → true (https)
# - OSM_REDIRECT_URI: auto-generated → "{HANKO_API_URL}/auth/osm/callback"
```

Then load it:

```python
from hotosm_auth import AuthConfig

# Auto-load from .env
config = AuthConfig.from_env()

# Or configure manually (advanced)
config = AuthConfig(
    hanko_api_url="https://login.hotosm.org",
    cookie_secret="your-secret-key-min-32-bytes-long",
    # cookie_domain, cookie_secure, osm_redirect_uri auto-detected!
    osm_enabled=True,
    osm_client_id="your-osm-client-id",
    osm_client_secret="your-osm-client-secret",
)
```

### 2. Validate JWT Token

```python
from hotosm_auth.jwt_validator import JWTValidator

validator = JWTValidator(config)

# From cookie or Authorization header
token = request.cookies.get("hanko")
user = await validator.validate_token(token)

print(f"User: {user.email} ({user.id})")
```

### 3. Handle OSM Connection

```python
from hotosm_auth.crypto import CookieCrypto

crypto = CookieCrypto(config.cookie_secret)

# After OSM OAuth callback
encrypted_cookie = crypto.encrypt_osm_connection(osm_connection)
response.set_cookie("osm_connection", encrypted_cookie, httponly=True)

# On subsequent requests
encrypted = request.cookies.get("osm_connection")
if encrypted:
    osm_conn = crypto.decrypt_osm_connection(encrypted)
    print(f"OSM User: {osm_conn.osm_username}")
```

## Architecture

### No Database Table for OSM Tokens

Unlike traditional OAuth implementations, we do NOT store OSM tokens in a database table. Instead:

- **OSM tokens live in httpOnly cookies** (encrypted with Fernet)
- **No `osm_connections` table** needed
- **Per-request decryption** from cookie
- **Matches FMTM's current pattern** (osm-login-python)

**Benefits:**
- Zero database queries for token lookup
- Simpler app integration (no migrations)
- More secure (tokens only in user's browser)
- Better performance

**Trade-offs:**
- User must reconnect OSM on each device
- Can't centrally revoke OSM connections
- Can't list all users with OSM connected

### Data Models

```python
from hotosm_auth import HankoUser, OSMConnection

# HankoUser: From validated JWT
user = HankoUser(
    id="550e8400-e29b-41d4-a716-446655440000",
    email="user@example.com",
    email_verified=True,
    username="johndoe",
    created_at=datetime.now(),
    updated_at=datetime.now(),
)

# OSMConnection: From decrypted cookie
osm = OSMConnection(
    osm_user_id=123456,
    osm_username="johndoe_osm",
    osm_avatar_url="https://...",
    access_token="osm_access_token_here",
    refresh_token="osm_refresh_token_here",
    expires_at=datetime.now() + timedelta(days=30),
    scopes=["read_prefs", "write_api"],
)
```

## Framework Integration

### FastAPI

See `hotosm_auth.integrations.fastapi` for middleware and dependencies.

**Trailing Slash**: FastAPI routes don't use trailing slashes by default. The `@hotosm/hanko-auth` web component automatically detects this and sends requests without trailing slashes.

### Django

See `hotosm_auth.integrations.django` for middleware and decorators.

**Trailing Slash**: Django's `APPEND_SLASH=True` setting (default) redirects URLs without trailing slashes. The `@hotosm/hanko-auth` web component automatically detects this and sends requests with trailing slashes to avoid unnecessary redirects.

**Note**: The component detects the trailing slash preference per base-path by making a test request and comparing the final URL after redirects. This allows the same component to work with both FastAPI and Django backends in the same application (e.g., behind a reverse proxy with different base paths).

## Legacy User Mapping

For apps with existing users, create a mapping table to link Hanko UUIDs to your existing user IDs:

```python
# Your app's database
class UserMapping(Base):
    __tablename__ = "user_mapping"

    hanko_user_id = Column(String, primary_key=True)  # Hanko UUID
    legacy_user_id = Column(Integer, ForeignKey("users.id"))
    migrated_at = Column(DateTime, default=datetime.utcnow)
```

This allows gradual migration without breaking existing functionality.

## Development

```bash
# Install with dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Type checking
mypy src

# Formatting
black src tests
ruff src tests
```

## License

GPL-3.0-or-later

## Links

- [Hanko Documentation](https://docs.hanko.io/)
- [OSM OAuth 2.0](https://wiki.openstreetmap.org/wiki/OAuth#OAuth_2.0_2)
- [HOTOSM GitHub](https://github.com/hotosm)

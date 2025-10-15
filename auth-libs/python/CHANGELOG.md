# Changelog

All notable changes to hotosm-auth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-15

### Added

#### Core Features
- Initial release of `hotosm-auth` Python library
- Core authentication models (`HankoUser`, `OSMConnection`, `OSMScope`)
- JWT validation with JWKS using PyJWT RS256 (`JWTValidator`)
- Cookie encryption/decryption with Fernet AES-128-CBC + HMAC (`CookieCrypto`)
- Configuration management with `AuthConfig` (Pydantic validated)
- Custom exceptions for authentication errors
- httpOnly cookie-based session management (no database table needed)

#### FastAPI Integration (`hotosm_auth.integrations.fastapi`)
- **Zero-config setup**: `setup_auth(app)` - registers routes, middleware, and CORS
- **Simplified dependency injection**: `Auth` and `OptionalAuth` types
- **Auto-registered OSM OAuth routes**: `/auth/osm/login`, `/callback`, `/disconnect`, `/status`
- **Built-in middleware**: JWT validation, OSM connection injection
- **CORS configuration**: Auto-configured for Hanko domain

#### Django Integration (`hotosm_auth.integrations.django`)
- **Middleware**: `HankoAuthMiddleware` - adds `request.hotosm.user` and `request.hotosm.osm`
- **Decorators**: `@login_required`, `@osm_required`
- **Cookie management**: `set_osm_cookie()`, `clear_osm_cookie()`
- **Auto-registered OSM OAuth views** (when using `setup_auth()`)
- **Django settings integration**: Reads from `HOTOSM_AUTH` dict or `.env`

#### Configuration
- **Zero-config defaults**: Auto-detects `COOKIE_DOMAIN`, `COOKIE_SECURE`, `OSM_REDIRECT_URI` from `HANKO_API_URL`
- **Environment variable support**: All config via `.env` file (no manual dict needed)
- **Minimal required config**: Only `HANKO_API_URL` and `COOKIE_SECRET` needed
- **Smart defaults**: Cookie security settings based on URL scheme (http/https)

### Technical Details

- JWT validation using PyJWT with RS256
- JWKS caching (default 1 hour TTL)
- Fernet encryption for OSM cookies (AES-128-CBC + HMAC)
- httpOnly cookie-based session management
- No database table for OSM tokens (stored in encrypted cookies)
- Python 3.10+ support
- Full type hints throughout codebase
- Async-first design (async/await for JWT validation)

### Documentation

- Complete README with quickstart examples
- FastAPI integration guide with simplified API
- Django integration guide with middleware setup
- Production deployment examples (subdomain architecture)
- Inline documentation for all modules
- Test coverage for models, config, crypto, and integrations

### Breaking Changes

None (initial release)

### Migration Guide

Not applicable (initial release)

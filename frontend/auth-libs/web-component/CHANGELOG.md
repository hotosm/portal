# Changelog

All notable changes to @hotosm/hanko-auth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-15

### Added

#### Core Features
- Initial release of `<hotosm-auth>` web component
- Hanko SSO integration (Google, GitHub, Email/Password via `@teamhanko/hanko-elements`)
- Optional OSM connection support with OAuth 2.0
- Smart authentication flows:
  - Basic auth (no OSM)
  - Optional OSM (can skip)
  - Required OSM (mandatory)
- Session detection and auto-login on page load
- JWT syncing to httpOnly cookies for SSO across subdomains

#### Zero-Config Auto-Detection
- **Auto-detect `hanko-url`**: From `<meta name="hanko-url">`, `window.HANKO_URL`, or `window.location.origin`
- **Auto-detect `base-path`**: From `<base href="...">` tag in document
- **Auto-detect trailing slash preference**: Per-basePath detection (Django vs FastAPI)
- **Framework agnostic**: Automatically adapts to backend framework routing conventions

#### Event System
- `hanko-login` - User logged in with Hanko (detail: `{ user }`)
- `osm-connected` - OSM account connected (detail: `{ osm_username, osm_user_id }`)
- `osm-skipped` - User skipped OSM (if optional)
- `auth-complete` - Full authentication flow complete
- `logout` - User logged out

#### Customizable Attributes
- `hanko-url` - Hanko API URL (optional, auto-detected)
- `base-path` - Backend base path (optional, auto-detected from `<base>` tag)
- `osm-enabled` - Enable OSM integration (default: `false`)
- `osm-required` - Make OSM mandatory (default: `false`)
- `osm-scopes` - OSM OAuth scopes (default: `read_prefs`)
- `show-profile` - Show/hide user profile (default: `true`)
- `redirect-after-login` - Auto-redirect URL after login

#### Developer Experience
- **Debug mode**: Enable via `?debug=true` URL param or `localStorage.setItem('hanko-auth-debug', 'true')`
- **Conditional logging**: Debug logs only show when debug mode is enabled
- **Error handling**: Warnings and errors always visible
- **Per-basePath caching**: Trailing slash detection cached separately for each backend

### Technical Details

- Built as Web Component using Custom Elements API
- Shadow DOM for encapsulation and style isolation
- Integration with `@teamhanko/hanko-elements` v1.0.0
- httpOnly cookie-based session management
- Trailing slash detection via HTTP HEAD requests
- Framework agnostic (works with vanilla JS, React, Vue, Angular, Svelte, etc.)
- Works with FastAPI (no trailing slash), Django (trailing slash), and other frameworks
- UMD, ESM, and IIFE builds for maximum compatibility

### Documentation

- Complete README with quickstart examples
- Auto-detection behavior documented
- Framework compatibility guide (FastAPI, Django)
- Production deployment examples
- Event system documentation
- Attribute reference guide
- Debug mode instructions

### Breaking Changes

None (initial release)

### Migration Guide

Not applicable (initial release)

# @hotosm/hanko-auth

Web component for HOTOSM SSO authentication with Hanko and optional OSM integration.

## Features

- 🔐 **Hanko SSO Integration** - Login with Google, GitHub, Email/Password
- 🗺️ **OSM Connection** - Optional OpenStreetMap authorization
- ✨ **Zero-Config** - Auto-detects hanko-url and base-path from environment
- 🎨 **Customizable** - Flexible configuration via attributes
- 📦 **Framework Agnostic** - Works with vanilla JS, React, Vue, etc.
- 🔒 **Secure** - httpOnly cookies, CSRF protection

## Installation

```bash
npm install @hotosm/hanko-auth
```

Or via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@hotosm/hanko-auth/dist/hanko-auth.js"></script>
```

## Usage

### ✨ Zero-Config (Recommended)

The simplest way to use the component - no attributes needed!

```html
<!-- Hanko URL auto-detected from window.HANKO_URL or window.location.origin -->
<hotosm-auth></hotosm-auth>
```

Set the global Hanko URL before loading the component:

```html
<script>
  window.HANKO_URL = 'https://login.hotosm.org';
</script>
<hotosm-auth></hotosm-auth>
```

Or use a meta tag:

```html
<meta name="hanko-url" content="https://login.hotosm.org">
<hotosm-auth></hotosm-auth>
```

### Basic Authentication (Explicit URL)

```html
<hotosm-auth hanko-url="https://login.hotosm.org"></hotosm-auth>
```

### With Optional OSM

```html
<hotosm-auth
  osm-enabled>
</hotosm-auth>
```

### OSM Required

```html
<hotosm-auth
  osm-enabled
  osm-required
  osm-scopes="read_prefs write_api">
</hotosm-auth>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `hanko-url` | String | Auto-detected | Hanko API URL (see auto-detection below) |
| `base-path` | String | Auto-detected | Backend base path (e.g., "/fastapi" or "/django") |
| `osm-enabled` | Boolean | `false` | Enable OSM connection |
| `osm-required` | Boolean | `false` | Make OSM mandatory |
| `osm-scopes` | String | `"read_prefs"` | OSM OAuth scopes |
| `show-profile` | Boolean | `true` | Show user profile when logged in |
| `redirect-after-login` | String | - | Redirect URL after successful login |
| `debug` | Boolean | `false` | Enable debug logging |

### Auto-Detection

**hanko-url** is auto-detected in this priority order:
1. Explicit `hanko-url` attribute
2. `<meta name="hanko-url" content="...">` in `<head>`
3. `window.HANKO_URL` global variable
4. `window.location.origin` (same-origin as frontend)

**base-path** is auto-detected from `document.baseURI` or can be set explicitly.

**trailing-slash** is auto-detected per base-path by comparing the response URL after redirects:
- **FastAPI**: Automatically uses URLs without trailing slash (e.g., `/fastapi/auth/osm/status`)
- **Django**: Automatically uses URLs with trailing slash (e.g., `/django/auth/osm/status/`)
- Detection is cached per base-path for performance
- No configuration needed - works automatically with both frameworks

## Framework Compatibility

The component automatically adapts to different backend frameworks:

### Django

Django's `APPEND_SLASH=True` setting redirects URLs without trailing slashes. The component detects this and automatically adds trailing slashes to all OSM endpoints for Django backends.

```html
<!-- Django setup with <base> tag -->
<base href="/django/">
<hotosm-auth osm-enabled></hotosm-auth>

<!-- Component will call: /django/auth/osm/status/ (with trailing slash) -->
```

### FastAPI

FastAPI routes don't use trailing slashes by default. The component detects this and uses URLs without trailing slashes for FastAPI backends.

```html
<!-- FastAPI setup with <base> tag -->
<base href="/fastapi/">
<hotosm-auth osm-enabled></hotosm-auth>

<!-- Component will call: /fastapi/auth/osm/status (no trailing slash) -->
```

### Multiple Backends

The component can work with multiple backends in the same app (e.g., FastAPI and Django behind a reverse proxy). Each base-path gets its own trailing slash detection:

```html
<!-- FastAPI: /fastapi/auth/osm/status -->
<base href="/fastapi/">
<hotosm-auth osm-enabled></hotosm-auth>

<!-- Django: /django/auth/osm/status/ -->
<base href="/django/">
<hotosm-auth osm-enabled></hotosm-auth>
```

## Events

### `hanko-login`

Fired when user successfully logs in with Hanko.

```javascript
document.querySelector('hanko-auth').addEventListener('hanko-login', (e) => {
  console.log('User logged in:', e.detail.user);
  // e.detail.user = { id, email, username }
});
```

### `osm-connected`

Fired when user connects their OSM account.

```javascript
document.querySelector('hanko-auth').addEventListener('osm-connected', (e) => {
  console.log('OSM connected:', e.detail);
  // e.detail = { osm_user_id, osm_username, osm_avatar_url }
});
```

### `osm-skipped`

Fired when user skips OSM connection (only if `osm-required="false"`).

```javascript
document.querySelector('hanko-auth').addEventListener('osm-skipped', () => {
  console.log('User skipped OSM connection');
});
```

### `auth-complete`

Fired when authentication is fully complete (Hanko + OSM if required).

```javascript
document.querySelector('hanko-auth').addEventListener('auth-complete', (e) => {
  console.log('Authentication complete');
  // Redirect or show app
  window.location.href = '/dashboard';
});
```

### `logout`

Fired when user logs out.

```javascript
document.querySelector('hanko-auth').addEventListener('logout', () => {
  console.log('User logged out');
  window.location.href = '/';
});
```

## Debugging

Enable debug mode to see detailed logs in the browser console:

### Via URL Parameter

```
https://yourapp.com?debug=true
```

### Via localStorage

```javascript
localStorage.setItem('hanko-auth-debug', 'true');
```

### Via Attribute

```html
<hotosm-auth debug></hotosm-auth>
```

Debug logs include:
- Hanko URL auto-detection
- Base path detection
- Trailing slash detection
- API request/response details
- Authentication state changes

## Examples

See the `examples/` directory for complete working examples:

- `examples/basic.html` - Basic login without OSM
- `examples/with-osm.html` - Optional OSM connection
- `examples/osm-required.html` - Mandatory OSM connection

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173/examples/basic.html

## License

AGPL-3.0

/**
 * @hotosm/hanko-auth Web Component
 *
 * Smart authentication component that handles:
 * - Hanko SSO (Google, GitHub, Email)
 * - Optional OSM connection
 * - Session management
 * - Event dispatching
 */

import { register } from '@teamhanko/hanko-elements';

class HankoAuth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Component state
    this.state = {
      user: null,
      osmConnected: false,
      osmData: null,
      osmLoading: false,
      loading: true,
      error: null
    };

    // Auto-detected trailing slash preference per basePath
    this._trailingSlashCache = {};

    // Debug mode (check URL params or localStorage)
    this._debugMode = this._checkDebugMode();

    // Bind methods
    this.handleHankoSuccess = this.handleHankoSuccess.bind(this);
    this.handleOSMConnect = this.handleOSMConnect.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  // Observed attributes
  static get observedAttributes() {
    return [
      'hanko-url',
      'base-path',
      'auth-path',
      'osm-enabled',
      'osm-required',
      'osm-scopes',
      'show-profile',
      'redirect-after-login'
    ];
  }

  // Getters for attributes
  get hankoUrl() {
    // Priority 1: Explicit hanko-url attribute
    const attr = this.getAttribute('hanko-url');
    if (attr) {
      return attr;
    }

    // Priority 2: <meta name="hanko-url"> in <head>
    const metaTag = document.querySelector('meta[name="hanko-url"]');
    if (metaTag) {
      const content = metaTag.getAttribute('content');
      if (content) {
        this.log('🔍 hanko-url auto-detected from <meta> tag:', content);
        return content;
      }
    }

    // Priority 3: window.HANKO_URL global variable
    if (window.HANKO_URL) {
      this.log('🔍 hanko-url auto-detected from window.HANKO_URL:', window.HANKO_URL);
      return window.HANKO_URL;
    }

    // Priority 4: Same origin as frontend (useful for proxied setups)
    const origin = window.location.origin;
    this.log('🔍 hanko-url auto-detected from window.location.origin:', origin);
    return origin;
  }

  get basePath() {
    return this.getAttribute('base-path');
  }

  get authPath() {
    return this.getAttribute('auth-path') || '/api/auth/osm';
  }

  get osmEnabled() {
    return this.hasAttribute('osm-enabled') && this.getAttribute('osm-enabled') !== 'false';
  }

  get osmRequired() {
    return this.hasAttribute('osm-required') && this.getAttribute('osm-required') !== 'false';
  }

  get osmScopes() {
    return this.getAttribute('osm-scopes') || 'read_prefs';
  }

  get showProfile() {
    return !this.hasAttribute('show-profile') || this.getAttribute('show-profile') !== 'false';
  }

  get redirectAfterLogin() {
    return this.getAttribute('redirect-after-login');
  }

  // Check if debug mode is enabled
  _checkDebugMode() {
    // Check URL parameter ?debug=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      return true;
    }

    // Check localStorage
    try {
      return localStorage.getItem('hanko-auth-debug') === 'true';
    } catch (e) {
      return false;
    }
  }

  // Conditional logging (only logs if debug mode is enabled)
  log(...args) {
    if (this._debugMode) {
      console.log(...args);
    }
  }

  // Warning and error logs always show (even without debug mode)
  warn(...args) {
    console.warn(...args);
  }

  error(...args) {
    console.error(...args);
  }

  // Helper to get base path from attribute or document.baseURI (respects <base> tag)
  getBasePath() {
    // Priority 1: Use explicit base-path attribute if provided (even if empty string)
    if (this.hasAttribute('base-path')) {
      this.log('🔍 getBasePath() using attribute:', this.basePath);
      return this.basePath || '';
    }

    // Priority 2: Extract from document.baseURI (respects <base> tag)
    try {
      const baseUri = new URL(document.baseURI || window.location.href);
      const pathname = baseUri.pathname.replace(/\/$/, ''); // Remove trailing slash
      this.log('🔍 getBasePath() called:');
      this.log('  document.baseURI:', document.baseURI);
      this.log('  window.location.href:', window.location.href);
      this.log('  baseUri.pathname:', baseUri.pathname);
      this.log('  result:', pathname);
      return pathname;
    } catch (e) {
      this.error('getBasePath() error:', e);
      return '';
    }
  }

  // Helper to add trailing slash based on auto-detected preference for this basePath
  addTrailingSlash(path, basePath) {
    // Check if we've detected the preference for this basePath
    const needsSlash = this._trailingSlashCache[basePath];
    if (needsSlash !== undefined && needsSlash && !path.endsWith('/')) {
      return path + '/';
    }
    return path;
  }

  // Auto-detect if trailing slash is needed by checking response.url after redirect
  async detectTrailingSlash(basePath, endpoint) {
    // If already detected for this basePath, use cached value
    if (this._trailingSlashCache[basePath] !== undefined) {
      this.log(`🔍 Using cached trailing slash preference for ${basePath}: ${this._trailingSlashCache[basePath]}`);
      return this._trailingSlashCache[basePath];
    }

    const origin = window.location.origin;
    const pathWithoutSlash = `${basePath}${endpoint}`;

    this.log('🔍 Auto-detecting trailing slash preference...');
    this.log(`  Testing: ${origin}${pathWithoutSlash}`);

    try {
      // Try WITHOUT trailing slash and let browser follow redirects
      const response = await fetch(`${origin}${pathWithoutSlash}`, {
        method: 'GET',
        credentials: 'include',
        redirect: 'follow'  // Let browser follow redirects
      });

      // Check if final URL (after redirects) has trailing slash
      const finalUrl = new URL(response.url);
      const finalPath = finalUrl.pathname;

      this.log(`  Original path: ${pathWithoutSlash}`);
      this.log(`  Final path: ${finalPath}`);

      // If we were redirected to a URL with trailing slash, cache true
      if (!pathWithoutSlash.endsWith('/') && finalPath.endsWith('/')) {
        this.log(`  ✅ Detected trailing slash needed (redirected to ${finalPath})`);
        this._trailingSlashCache[basePath] = true;
        return true;
      }

      // Otherwise, no trailing slash needed
      this.log('  ✅ Detected no trailing slash needed');
      this._trailingSlashCache[basePath] = false;
      return false;

    } catch (error) {
      console.error('  ❌ Error during trailing slash detection:', error);
      // Default: no trailing slash
      this._trailingSlashCache[basePath] = false;
      return false;
    }
  }

  connectedCallback() {
    this.log('🔌 hanko-auth connectedCallback called');
    this.log('  hankoUrl:', this.hankoUrl);
    this.log('  getAttribute("hanko-url"):', this.getAttribute('hanko-url'));
    this.log('  all attributes:', Array.from(this.attributes).map(a => `${a.name}="${a.value}"`));

    // Always render, even if attributes are missing
    this.render();

    // hankoUrl getter always returns a value (at minimum: window.location.origin)
    // so we don't need to validate it anymore

    this.log('✅ Starting init with hankoUrl:', this.hankoUrl);
    this.init();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      // If osm-enabled changed to true and user is logged in, check OSM connection
      if (name === 'osm-enabled' && this.osmEnabled && this.state.user) {
        this.log('🔄 osm-enabled changed to true, checking OSM connection...');
        this.checkOSMConnection();
      }

      this.render();
    }
  }

  async init() {
    try {
      // Register Hanko elements
      await register(this.hankoUrl);

      // Check current session
      await this.checkSession();

      // Always check OSM connection on init to detect if user just returned from OAuth
      // This will dispatch 'osm-connected' event if connected
      await this.checkOSMConnection();

      this.state.loading = false;
      this.render();

      // Setup event listeners
      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to initialize hanko-auth:', error);
      this.state.error = error.message;
      this.state.loading = false;
      this.render();
    }
  }

  async checkSession() {
    this.log('🔍 Checking for existing Hanko session...');
    try {
      // Check if there's an existing Hanko session
      const { Hanko } = await import('@teamhanko/hanko-elements');
      const hanko = new Hanko(this.hankoUrl);

      this.log('📡 Hanko client created, checking session validity...');

      // Try to get current user - if this succeeds, session is valid
      try {
        const user = await hanko.user.getCurrent();
        this.log('✅ Valid Hanko session found');
        this.log('👤 Existing user session:', user);

        this.state.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          emailVerified: user.email_verified || false
        };

        // Dispatch events for existing session
        this.dispatchEvent(new CustomEvent('hanko-login', {
          detail: { user: this.state.user }
        }));

        this.dispatchEvent(new CustomEvent('auth-complete'));

        // Sync JWT to cookie for SSO across different ports
        await this.syncJWTToCookie();
      } catch (userError) {
        this.log('ℹ️ No valid Hanko session found - user needs to login');
      }
    } catch (error) {
      this.log('⚠️ Session check error:', error);
      this.log('ℹ️ No existing session - user needs to login');
      // No session is not an error, just means user needs to login
    }
  }

  async syncJWTToCookie() {
    try {
      // Use JWT from session event if available
      const jwt = this._sessionJWT;

      if (jwt) {
        // Auto-detect domain for cookie
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

        // For localhost: use explicit domain=localhost to share across ports
        // For production: don't set domain (defaults to current domain)
        const domainPart = isLocalhost ? '; domain=localhost' : '';

        document.cookie = `hanko=${jwt}; path=/${domainPart}; max-age=86400; SameSite=Lax`;
        this.log(`🔐 JWT synced to cookie for SSO${isLocalhost ? ' (domain=localhost)' : ''}`);
      } else {
        this.log('⚠️ No JWT found in session event');
      }
    } catch (error) {
      console.error('Failed to sync JWT to cookie:', error);
    }
  }

  async checkOSMConnection() {
    // If already connected, no need to check again
    if (this.state.osmConnected) {
      this.log('⏭️ Already connected to OSM, skipping check');
      return;
    }

    // Set loading state and render
    this.state.osmLoading = true;
    this.render();

    try {
      const basePath = this.getBasePath();
      const authPath = this.authPath;

      // Auto-detect trailing slash preference for this basePath
      await this.detectTrailingSlash(basePath, `${authPath}/status`);

      // Construct absolute URL to avoid <base> tag interference
      const origin = window.location.origin;
      let statusPath = `${basePath}${authPath}/status`;

      // Add trailing slash if detected for this basePath
      statusPath = this.addTrailingSlash(statusPath, basePath);

      const statusUrl = `${origin}${statusPath}`;
      this.log('🔍 Checking OSM connection at:', statusUrl);
      this.log('🍪 Current cookies:', document.cookie);

      const response = await fetch(statusUrl, {
        credentials: 'include',
        redirect: 'follow'  // Follow redirects but with cookies
      });

      this.log('📡 OSM status response:', response.status);
      this.log('📡 Final URL after redirects:', response.url);

      if (response.ok) {
        const data = await response.json();
        this.log('📡 OSM status data:', data);

        if (data.connected) {
          this.log('✅ OSM is connected:', data.osm_username);
          this.state.osmConnected = true;
          this.state.osmData = data;

          // Dispatch event to notify that OSM is connected (for auto-enabling switch)
          this.dispatchEvent(new CustomEvent('osm-connected', {
            detail: { osmData: data },
            bubbles: true,
            composed: true
          }));
        } else {
          this.log('❌ OSM is NOT connected');
          this.state.osmConnected = false;
          this.state.osmData = null;
        }
      }
    } catch (error) {
      console.error('OSM connection check failed:', error);
    } finally {
      // Clear loading state and render final result
      this.state.osmLoading = false;
      this.render();
    }
  }

  setupEventListeners() {
    const hankoAuth = this.shadowRoot.querySelector('hanko-auth');

    if (hankoAuth) {
      // Only listen to onSessionCreated event (Hanko v2)
      // Use { once: false } but track if we already handled this session
      hankoAuth.addEventListener('onSessionCreated', (e) => {
        this.log(`🎯 Hanko event: onSessionCreated`, e.detail);

        // Prevent duplicate handling of the same session
        const sessionId = e.detail?.claims?.session_id;
        if (sessionId && this._lastSessionId === sessionId) {
          this.log('⏭️ Skipping duplicate session event');
          return;
        }
        this._lastSessionId = sessionId;

        this.handleHankoSuccess(e);
      });

      // Hanko logout event
      hankoAuth.addEventListener('hankoAuthLogout', this.handleLogout);
    }

    // OSM connect button
    const osmButton = this.shadowRoot.querySelector('#osm-connect-btn');
    if (osmButton) {
      osmButton.addEventListener('click', this.handleOSMConnect);
    }

    // Logout button
    const logoutButton = this.shadowRoot.querySelector('#logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', this.handleLogout);
    }

    // Skip OSM button (if optional)
    const skipButton = this.shadowRoot.querySelector('#skip-osm-btn');
    if (skipButton) {
      skipButton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('osm-skipped'));
        this.dispatchEvent(new CustomEvent('auth-complete'));
        if (this.redirectAfterLogin) {
          window.location.href = this.redirectAfterLogin;
        }
      });
    }
  }

  async handleHankoSuccess(event) {
    this.log('Hanko auth success:', event.detail);

    // Extract user ID and JWT from event (Hanko v2 format)
    const claims = event.detail?.claims || {};
    const userId = claims.subject || claims.sub;

    // Store JWT from event for cookie sync
    this._sessionJWT = event.detail?.jwt || null;

    if (!userId) {
      console.error('No user ID found in claims');
      return;
    }

    // Fetch full user info from Hanko API using the Hanko client
    try {
      // Use Hanko's user client to get full profile
      const { Hanko } = await import('@teamhanko/hanko-elements');
      const hanko = new Hanko(this.hankoUrl);

      const user = await hanko.user.getCurrent();
      this.log('👤 User data from Hanko:', user);

      this.state.user = {
        id: user.id || userId,
        email: user.email,
        username: user.username,
        emailVerified: user.email_verified || false
      };
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // Fallback: use only user ID from claims
      this.state.user = {
        id: userId,
        email: null,
        username: null,
        emailVerified: false
      };
    }

    this.log('✅ User state updated:', this.state.user);

    // Re-render to show profile instead of login form
    this.render();

    // Dispatch hanko-login event
    this.dispatchEvent(new CustomEvent('hanko-login', {
      detail: { user: this.state.user }
    }));

    // Dispatch auth-complete event (OSM is optional)
    this.dispatchEvent(new CustomEvent('auth-complete'));

    // Sync JWT to cookie for SSO across different ports
    await this.syncJWTToCookie();

    if (this.redirectAfterLogin) {
      window.location.href = this.redirectAfterLogin;
    }
  }

  async handleOSMConnect() {
    // Redirect to OSM OAuth
    // Respect document.baseURI (from <base> tag) to work with sub-paths
    const scopes = this.osmScopes.split(' ').join('+');
    const basePath = this.getBasePath();
    const authPath = this.authPath;

    // Auto-detect trailing slash preference for this basePath
    await this.detectTrailingSlash(basePath, `${authPath}/login`);

    // Construct absolute URL to avoid <base> tag interference
    const origin = window.location.origin;
    let loginPath = `${basePath}${authPath}/login`;

    // Add trailing slash if detected for this basePath
    loginPath = this.addTrailingSlash(loginPath, basePath);

    const fullUrl = `${origin}${loginPath}?scopes=${scopes}`;

    this.log('🔗 OSM Connect clicked!');
    this.log('  window.location.origin:', origin);
    this.log('  basePath:', basePath);
    this.log('  authPath:', authPath);
    this.log('  loginPath:', loginPath);
    this.log('  Full URL to redirect to:', fullUrl);
    this.log('  About to set window.location.href...');

    window.location.href = fullUrl;

    this.log('  window.location.href was set (this may not log if redirect is immediate)');
  }

  async handleLogout() {
    this.log('🚪 Logout initiated');
    this.log('📊 Current state before logout:', {
      user: this.state.user,
      osmConnected: this.state.osmConnected,
      osmData: this.state.osmData
    });
    this.log('🍪 Cookies before logout:', document.cookie);

    // Clear OSM connection first (before clearing JWT cookie)
    // Always try to disconnect OSM, regardless of osmEnabled switch state
    try {
      const basePath = this.getBasePath();
      const authPath = this.authPath;
      // Construct absolute URL to avoid <base> tag interference
      const origin = window.location.origin;
      const disconnectPath = this.addTrailingSlash(`${basePath}${authPath}/disconnect`, basePath);
      const disconnectUrl = `${origin}${disconnectPath}`;
      this.log('🔌 Calling OSM disconnect:', disconnectUrl);

      const response = await fetch(disconnectUrl, {
        method: 'POST',
        credentials: 'include'
      });

      this.log('📡 Disconnect response status:', response.status);
      this.log('📡 Disconnect response headers:', [...response.headers.entries()]);

      const data = await response.json();
      this.log('📡 Disconnect response data:', data);
      this.log('✅ OSM disconnected');
    } catch (error) {
      console.error('❌ OSM disconnect failed:', error);
    }

    // Use Hanko SDK to properly logout
    try {
      const { Hanko } = await import('@teamhanko/hanko-elements');
      const hanko = new Hanko(this.hankoUrl);
      await hanko.user.logout();
      this.log('✅ Hanko logout successful');
    } catch (error) {
      console.error('Hanko logout failed:', error);
    }

    // Clear the JWT cookie (try with and without domain)
    document.cookie = 'hanko=; path=/; domain=localhost; max-age=0';
    document.cookie = 'hanko=; path=/; max-age=0';

    // Also clear the OSM cookie from the client side (belt and suspenders)
    // Clear with domain=localhost
    document.cookie = 'osm_connection=; path=/; domain=localhost; max-age=0';
    // Clear without domain (for cookies set without explicit domain)
    document.cookie = 'osm_connection=; path=/; max-age=0';

    this.log('🍪 Cookies cleared');

    // Clear local state
    this.state.user = null;
    this.state.osmConnected = false;
    this.state.osmData = null;

    this.dispatchEvent(new CustomEvent('logout'));

    // Force page reload to ensure all cookies and state are cleared
    // This guarantees OSM won't persist after logout
    this.log('🔄 Reloading page to clear all session data...');
    window.location.reload();
  }

  render() {
    const styles = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          padding: 12px;
          color: #c33;
          margin-bottom: 16px;
        }

        .profile {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          color: #666;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .profile-email {
          font-size: 14px;
          color: #666;
        }

        .osm-section {
          border-top: 1px solid #e5e5e5;
          padding-top: 16px;
          padding-bottom: 16px;
          margin-top: 16px;
          margin-bottom: 16px;
          text-align: center;
        }

        .osm-connected {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
          border-radius: 8px;
          border: 1px solid #c3e6c3;
        }

        .osm-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2d7a2d;
          font-weight: 500;
          font-size: 14px;
          text-align: left;
        }

        .osm-badge-icon {
          font-size: 18px;
        }

        .osm-username {
          font-size: 13px;
          color: #5a905a;
          margin-top: 4px;
        }

        button {
          width: 100%;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #d73f3f;
          color: white;
        }

        .btn-primary:hover {
          background: #c23535;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          margin-top: 8px;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-logout {
          background: transparent;
          border: 1px solid #ddd;
          color: #666;
        }

        .btn-logout:hover {
          background: #f5f5f5;
        }

        .osm-prompt {
          background: #fff8e6;
          border: 1px solid #ffe066;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          text-align: center;
        }

        .osm-prompt-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 12px;
          color: #333;
          text-align: center;
        }

        .osm-prompt-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
          text-align: center;
        }
      </style>
    `;

    let content = '';

    if (this.state.loading) {
      content = `
        <div class="container">
          <div class="loading">Loading...</div>
        </div>
      `;
    } else if (this.state.error) {
      content = `
        <div class="container">
          <div class="error">${this.state.error}</div>
        </div>
      `;
    } else if (this.state.user) {
      // User is logged in
      const needsOSM = this.osmEnabled && !this.state.osmConnected && !this.state.osmLoading;
      const displayName = this.state.user.username || this.state.user.email || this.state.user.id;
      const initial = displayName ? displayName[0].toUpperCase() : 'U';

      content = `
        <div class="container">
          ${this.showProfile ? `
            <div class="profile">
              <div class="profile-header">
                <div class="profile-avatar">${initial}</div>
                <div class="profile-info">
                  <div class="profile-name">${this.state.user.username || this.state.user.email || 'User'}</div>
                  <div class="profile-email">${this.state.user.email || this.state.user.id}</div>
                </div>
              </div>

              ${this.osmEnabled && this.state.osmLoading ? `
                <div class="osm-section">
                  <div class="loading">Checking OSM connection...</div>
                </div>
              ` : this.osmEnabled && this.state.osmConnected ? `
                <div class="osm-section">
                  <div class="osm-connected">
                    <div class="osm-badge">
                      <span class="osm-badge-icon">🗺️</span>
                      <div>
                        <div>Connected to OpenStreetMap</div>
                        ${this.state.osmData?.osm_username ? `
                          <div class="osm-username">@${this.state.osmData.osm_username}</div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ` : ''}

              ${needsOSM ? `
                <div class="osm-section">
                  <div class="osm-prompt-title">
                    ${this.osmRequired ? '🗺️ OSM Required' : '🗺️ Connect OSM'}
                  </div>
                  <div class="osm-prompt-text">
                    ${this.osmRequired
                      ? 'This endpoint requires OSM connection.'
                      : 'Connect your OSM account for full features.'}
                  </div>
                  <button id="osm-connect-btn" class="btn-primary">
                    Connect OSM Account
                  </button>
                  ${!this.osmRequired ? `
                    <button id="skip-osm-btn" class="btn-secondary">
                      Skip for now
                    </button>
                  ` : ''}
                </div>
              ` : ''}

              <button id="logout-btn" class="btn-logout">
                Logout
              </button>
            </div>
          ` : needsOSM ? `
            <div class="osm-prompt">
              <div class="osm-prompt-title">
                ${this.osmRequired ? 'OpenStreetMap Required' : 'Connect OpenStreetMap'}
              </div>
              <div class="osm-prompt-text">
                ${this.osmRequired
                  ? 'This app requires an OSM connection to continue.'
                  : 'Connect your OSM account for full features.'}
              </div>
              <button id="osm-connect-btn" class="btn-primary">
                Connect OSM Account
              </button>
              ${!this.osmRequired ? `
                <button id="skip-osm-btn" class="btn-secondary">
                  Skip for now
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Not logged in - show Hanko login from @teamhanko/hanko-elements
      content = `
        <div class="container">
          <hanko-auth></hanko-auth>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = styles + content;

    // Re-setup event listeners after render
    if (!this.state.loading) {
      setTimeout(() => this.setupEventListeners(), 0);
    }
  }
}

// Define the custom element with a different name to avoid conflict with @teamhanko/hanko-elements
customElements.define('hotosm-auth', HankoAuth);

export default HankoAuth;

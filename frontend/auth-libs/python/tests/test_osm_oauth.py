"""
Tests for OSM OAuth integration.

Note: These test the OAuth client logic. Integration tests with
real OSM API should be in a separate test suite.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch

from hotosm_auth.config import AuthConfig
from hotosm_auth.osm_oauth import OSMOAuthClient
from hotosm_auth.exceptions import OSMOAuthError


@pytest.fixture
def osm_config():
    """Create test OSM configuration."""
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="test-secret-key-must-be-32-bytes-long",
        osm_enabled=True,
        osm_client_id="test_client_id",
        osm_client_secret="test_client_secret",
        osm_redirect_uri="https://app.test.com/auth/osm/callback",
        osm_scopes=["read_prefs", "write_api"],
    )


def test_osm_client_init(osm_config):
    """Test OSM OAuth client initialization."""
    client = OSMOAuthClient(osm_config)

    assert client.client_id == "test_client_id"
    assert client.client_secret == "test_client_secret"
    assert client.redirect_uri == "https://app.test.com/auth/osm/callback"
    assert len(client.scopes) == 2


def test_osm_client_init_without_osm_enabled():
    """Test that client raises error if OSM not enabled."""
    config = AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="test-secret-key-must-be-32-bytes-long",
        osm_enabled=False,
    )

    with pytest.raises(ValueError, match="OSM OAuth not enabled"):
        OSMOAuthClient(config)


def test_get_authorization_url(osm_config):
    """Test generating authorization URL."""
    client = OSMOAuthClient(osm_config)

    auth_url = client.get_authorization_url(state="random_state_123")

    assert "oauth2/authorize" in auth_url
    assert "client_id=test_client_id" in auth_url
    assert "redirect_uri=https%3A%2F%2Fapp.test.com" in auth_url
    assert "state=random_state_123" in auth_url
    assert "scope=read_prefs+write_api" in auth_url
    assert "response_type=code" in auth_url


def test_get_authorization_url_custom_scopes(osm_config):
    """Test authorization URL with custom scopes."""
    client = OSMOAuthClient(osm_config)

    auth_url = client.get_authorization_url(
        state="test",
        scopes=["read_prefs"],
    )

    assert "scope=read_prefs" in auth_url
    assert "write_api" not in auth_url


@pytest.mark.asyncio
async def test_exchange_code_success(osm_config):
    """Test successful code exchange."""
    client = OSMOAuthClient(osm_config)

    # Mock httpx responses
    mock_token_response = Mock()
    mock_token_response.json.return_value = {
        "access_token": "test_access_token",
        "refresh_token": "test_refresh_token",
        "expires_in": 3600,
        "scope": "read_prefs write_api",
    }

    mock_user_response = Mock()
    mock_user_response.json.return_value = {
        "user": {
            "id": 123456,
            "display_name": "testuser",
            "img": {"href": "https://example.com/avatar.jpg"},
        }
    }

    with patch("httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.post.return_value = mock_token_response
        mock_client.get.return_value = mock_user_response
        mock_client_class.return_value = mock_client

        osm_conn = await client.exchange_code("auth_code_123")

        assert osm_conn.osm_user_id == 123456
        assert osm_conn.osm_username == "testuser"
        assert osm_conn.access_token == "test_access_token"
        assert osm_conn.refresh_token == "test_refresh_token"
        assert len(osm_conn.scopes) == 2
        assert "read_prefs" in osm_conn.scopes


@pytest.mark.asyncio
async def test_exchange_code_no_access_token(osm_config):
    """Test code exchange with missing access token."""
    client = OSMOAuthClient(osm_config)

    mock_response = Mock()
    mock_response.json.return_value = {}  # Missing access_token

    with patch("httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.post.return_value = mock_response
        mock_client_class.return_value = mock_client

        with pytest.raises(OSMOAuthError, match="No access_token"):
            await client.exchange_code("auth_code_123")

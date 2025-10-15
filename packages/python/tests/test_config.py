"""
Tests for configuration.
"""

import pytest
from pydantic import ValidationError

from hotosm_auth.config import AuthConfig


def test_basic_config():
    """Test basic configuration without OSM."""
    config = AuthConfig(
        hanko_api_url="https://login.hotosm.org",
        cookie_secret="this-is-a-secret-key-min-32-bytes-long",
    )

    assert str(config.hanko_api_url) == "https://login.hotosm.org/"
    assert config.cookie_secret == "this-is-a-secret-key-min-32-bytes-long"
    assert config.osm_enabled is False
    assert config.cookie_secure is True
    assert config.jwks_cache_ttl == 3600


def test_config_with_osm():
    """Test configuration with OSM enabled."""
    config = AuthConfig(
        hanko_api_url="https://login.hotosm.org",
        cookie_secret="this-is-a-secret-key-min-32-bytes-long",
        osm_enabled=True,
        osm_client_id="test_client_id",
        osm_client_secret="test_client_secret",
        osm_redirect_uri="https://app.hotosm.org/auth/osm/callback",
        osm_scopes=["read_prefs", "write_api"],
    )

    assert config.osm_enabled is True
    assert config.osm_client_id == "test_client_id"
    assert config.osm_client_secret == "test_client_secret"
    assert len(config.osm_scopes) == 2


def test_config_osm_requires_credentials():
    """Test that OSM enabled requires client credentials."""
    with pytest.raises(ValueError, match="osm_client_id is required"):
        AuthConfig(
            hanko_api_url="https://login.hotosm.org",
            cookie_secret="this-is-a-secret-key-min-32-bytes-long",
            osm_enabled=True,
        )


def test_config_short_secret():
    """Test that short secrets are rejected."""
    with pytest.raises(ValidationError):
        AuthConfig(
            hanko_api_url="https://login.hotosm.org",
            cookie_secret="too-short",
        )


def test_config_default_jwt_issuer():
    """Test that JWT issuer defaults to Hanko API URL."""
    config = AuthConfig(
        hanko_api_url="https://login.hotosm.org",
        cookie_secret="this-is-a-secret-key-min-32-bytes-long",
    )

    assert config.jwt_issuer == "https://login.hotosm.org/"


def test_config_custom_jwt_issuer():
    """Test custom JWT issuer."""
    config = AuthConfig(
        hanko_api_url="https://login.hotosm.org",
        cookie_secret="this-is-a-secret-key-min-32-bytes-long",
        jwt_issuer="https://custom-issuer.com",
    )

    assert config.jwt_issuer == "https://custom-issuer.com"


def test_config_local_dev():
    """Test configuration for local development."""
    config = AuthConfig(
        hanko_api_url="http://localhost:8000",
        cookie_secret="local-dev-secret-key-min-32-bytes",
        cookie_secure=False,  # Allow HTTP for local dev
        osm_api_url="https://master.apis.dev.openstreetmap.org",
    )

    assert str(config.hanko_api_url) == "http://localhost:8000/"
    assert config.cookie_secure is False
    assert str(config.osm_api_url) == "https://master.apis.dev.openstreetmap.org/"


def test_config_immutable():
    """Test that config is immutable after creation."""
    config = AuthConfig(
        hanko_api_url="https://login.hotosm.org",
        cookie_secret="this-is-a-secret-key-min-32-bytes-long",
    )

    with pytest.raises(ValidationError):
        config.cookie_secret = "new-secret"

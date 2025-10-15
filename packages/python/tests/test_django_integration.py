"""
Tests for Django integration.

Note: These are basic unit tests. Full Django integration tests
require a Django project setup.
"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import OSMConnection
from hotosm_auth.integrations.django import (
    get_token_from_request,
    get_osm_connection,
)


@pytest.fixture
def mock_django_settings():
    """Mock Django settings."""
    settings = Mock()
    settings.HOTOSM_AUTH = {
        "hanko_api_url": "https://test.hanko.io",
        "cookie_secret": "test-secret-key-must-be-32-bytes-long",
        "cookie_secure": False,
    }
    return settings


def test_get_token_from_bearer_header():
    """Test extracting token from Authorization header."""
    request = Mock()
    request.META = {"HTTP_AUTHORIZATION": "Bearer test_token_123"}
    request.COOKIES = {}

    token = get_token_from_request(request)
    assert token == "test_token_123"


def test_get_token_from_cookie():
    """Test extracting token from cookie."""
    request = Mock()
    request.META = {}
    request.COOKIES = {"hanko": "cookie_token_456"}

    token = get_token_from_request(request)
    assert token == "cookie_token_456"


def test_get_token_priority():
    """Test that Authorization header takes priority over cookie."""
    request = Mock()
    request.META = {"HTTP_AUTHORIZATION": "Bearer header_token"}
    request.COOKIES = {"hanko": "cookie_token"}

    token = get_token_from_request(request)
    assert token == "header_token"


def test_get_token_none():
    """Test when no token is present."""
    request = Mock()
    request.META = {}
    request.COOKIES = {}

    token = get_token_from_request(request)
    assert token is None


def test_get_osm_connection_no_cookie():
    """Test getting OSM connection when no cookie present."""
    request = Mock()
    request.COOKIES = {}

    osm = get_osm_connection(request)
    assert osm is None


def test_get_osm_connection_invalid_cookie():
    """Test getting OSM connection with invalid cookie."""
    request = Mock()
    request.COOKIES = {"osm_connection": "invalid_encrypted_data"}

    # Should return None on decryption error
    with patch("hotosm_auth.integrations.django.get_cookie_crypto"):
        osm = get_osm_connection(request)
        # Will return None because invalid data can't be decrypted
        # (actual decryption happens in CookieCrypto which we're not testing here)

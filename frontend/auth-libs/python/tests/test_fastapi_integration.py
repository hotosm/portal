"""
Tests for FastAPI integration.

Note: These are basic unit tests. Integration tests with a real FastAPI
app should be in a separate test suite.
"""

import pytest
from datetime import datetime, timedelta

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.integrations.fastapi import (
    init_auth,
    get_config,
    get_jwt_validator,
    get_cookie_crypto,
)


@pytest.fixture
def auth_config():
    """Create test auth configuration."""
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="test-secret-key-must-be-32-bytes-long",
        cookie_secure=False,
    )


def test_init_auth(auth_config):
    """Test initialization of FastAPI auth."""
    init_auth(auth_config)

    # Should be able to get instances
    config = get_config()
    assert config is not None
    assert str(config.hanko_api_url) == "https://test.hanko.io/"

    validator = get_jwt_validator()
    assert validator is not None

    crypto = get_cookie_crypto()
    assert crypto is not None


def test_get_config_before_init():
    """Test that accessing config before init raises error."""
    # Reset global state
    import hotosm_auth.integrations.fastapi as fastapi_module
    fastapi_module._config = None

    with pytest.raises(RuntimeError, match="Auth not initialized"):
        get_config()


def test_get_jwt_validator_before_init():
    """Test that accessing validator before init raises error."""
    import hotosm_auth.integrations.fastapi as fastapi_module
    fastapi_module._jwt_validator = None

    with pytest.raises(RuntimeError, match="Auth not initialized"):
        get_jwt_validator()


def test_get_cookie_crypto_before_init():
    """Test that accessing crypto before init raises error."""
    import hotosm_auth.integrations.fastapi as fastapi_module
    fastapi_module._cookie_crypto = None

    with pytest.raises(RuntimeError, match="Auth not initialized"):
        get_cookie_crypto()

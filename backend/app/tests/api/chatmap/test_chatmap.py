# portal/backend/app/tests/api/chatmap/test_chatmap.py

"""Tests for ChatMap API endpoints."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import httpx

from app.api.routes.chatmap.chatmap import get_my_chatmap, CHATMAP_API_URL

BASE_URL = CHATMAP_API_URL

MOCK_MAPS_RESPONSE = [
    {"id": "map-uuid-1", "name": "Map 1"},
    {"id": "map-uuid-2", "name": "Map 2"},
]


class TestGetUserChatMaps:
    """Tests for GET /chatmap/user/maps endpoint"""

    @pytest.mark.asyncio
    async def test_get_my_chatmap_success(self):
        """Test successful retrieval of user's chatmaps"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_MAPS_RESPONSE
        mock_response.raise_for_status = Mock()

        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            result = await get_my_chatmap(request=mock_request, user=mock_user)

            assert result == MOCK_MAPS_RESPONSE
            assert len(result) == 2

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert f"{BASE_URL}/map" in call_args[0][0]

            cookies = call_args[1]["cookies"]
            assert cookies["hanko"] == "test-hanko-jwt"

    @pytest.mark.asyncio
    async def test_get_my_chatmap_empty(self):
        """Test retrieval when user has no maps"""
        mock_response = Mock()
        mock_response.json.return_value = []
        mock_response.raise_for_status = Mock()

        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            result = await get_my_chatmap(request=mock_request, user=mock_user)

            assert result == []

    @pytest.mark.asyncio
    async def test_get_my_chatmap_no_cookie(self):
        """Test returns 401 when hanko cookie is missing"""
        mock_request = Mock()
        mock_request.cookies.get.return_value = None

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        with pytest.raises(Exception) as exc_info:
            await get_my_chatmap(request=mock_request, user=mock_user)

        assert exc_info.value.status_code == 401
        assert "Hanko auth cookie not found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_my_chatmap_upstream_error(self):
        """Test handling of HTTP errors from ChatMap API"""
        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        mock_response = Mock()
        mock_response.status_code = 403
        mock_response.text = "Forbidden"
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "403 Forbidden", request=Mock(), response=mock_response
        )

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            with pytest.raises(Exception) as exc_info:
                await get_my_chatmap(request=mock_request, user=mock_user)

            assert exc_info.value.status_code == 403
            assert "Error from ChatMap API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_my_chatmap_connection_error(self):
        """Test handling of connection errors"""
        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection refused")
            )

            with pytest.raises(Exception) as exc_info:
                await get_my_chatmap(request=mock_request, user=mock_user)

            assert exc_info.value.status_code == 500
            assert "Connection refused" in exc_info.value.detail


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

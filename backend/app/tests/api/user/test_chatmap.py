# portal/backend/app/tests/api/chatmap/test_chatmap.py

"""Tests for ChatMap API endpoints."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import httpx

from app.api.routes.user.chatmap import get_my_chatmap, CHATMAP_API_BASE_URL

BASE_URL = CHATMAP_API_BASE_URL

MOCK_CHATMAP_RESPONSE = {
    "id": "abc123-map-uuid",
    "sharing": "private",
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "time": "2026-02-10T14:30:00",
                "username_id": "user1",
                "message": "Test location message",
                "file": None,
                "id": "point-1",
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-58.38, -34.61],
            },
        },
        {
            "type": "Feature",
            "properties": {
                "time": "2026-02-11T10:00:00",
                "username_id": "user2",
                "message": "Another location",
                "file": "abc123.jpg",
                "id": "point-2",
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-58.39, -34.62],
            },
        },
    ],
}

MOCK_EMPTY_CHATMAP_RESPONSE = {
    "id": "empty-map-uuid",
    "sharing": "private",
    "type": "FeatureCollection",
    "features": [],
}


class TestGetMyChatMap:
    """Tests for GET /chatmap/map endpoint"""

    @pytest.mark.asyncio
    async def test_get_my_chatmap_success(self):
        """Test successful retrieval of authenticated user's chatmap"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_CHATMAP_RESPONSE
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

            assert result == MOCK_CHATMAP_RESPONSE
            assert result["type"] == "FeatureCollection"
            assert len(result["features"]) == 2
            assert result["features"][0]["geometry"]["coordinates"] == [-58.38, -34.61]

            # Verify the request was made with correct URL
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert f"{BASE_URL}/map" in call_args[0][0]

            # Verify hanko cookie is forwarded
            cookies = call_args[1]["cookies"]
            assert cookies["hanko"] == "test-hanko-jwt"

    @pytest.mark.asyncio
    async def test_get_my_chatmap_empty(self):
        """Test retrieval when user has no points"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_EMPTY_CHATMAP_RESPONSE
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

            assert result["type"] == "FeatureCollection"
            assert len(result["features"]) == 0

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

    @pytest.mark.asyncio
    async def test_get_my_chatmap_feature_structure(self):
        """Test that GeoJSON feature structure is correct"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_CHATMAP_RESPONSE
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

            feature = result["features"][0]
            assert "type" in feature
            assert "properties" in feature
            assert "geometry" in feature
            assert feature["type"] == "Feature"
            assert feature["geometry"]["type"] == "Point"
            assert "coordinates" in feature["geometry"]
            assert "message" in feature["properties"]
            assert "username_id" in feature["properties"]
            assert "time" in feature["properties"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

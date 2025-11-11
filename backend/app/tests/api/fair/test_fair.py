import pytest
import httpx
from unittest.mock import AsyncMock, Mock, patch
from fastapi import HTTPException
from fastapi.params import Query


class TestGetFairProjects:
    """Test suite for get_fair_projects function"""
    
    @pytest.mark.asyncio
    async def test_get_fair_projects_success_default_params(self):
        """Test successful request with default parameters"""
        mock_response_data = {
            "results": [{"id": 1, "name": "AI Project 1"}],
            "count": 1
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[0].endpoint

            result = await endpoint()

            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/model/" in call_args[0][0]

            params = call_args[1]["params"]

            def val(v):
                return v.default if hasattr(v, "default") else v

            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0
            assert val(params["ordering"]) == "-created_at"
            assert "status" in params
            assert params["status"] is None or getattr(params["status"], "default", None) is None

            # Verify headers don't contain authentication
            headers = call_args[1]["headers"]
            assert "access-token" not in headers
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_fair_projects_with_all_params(self):
        """Test with all optional parameters provided"""
        mock_response_data = {"results": [], "count": 0}

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[0].endpoint

            result = await endpoint(
                status=1,
                limit=50,
                offset=10,
                search="mapping",
                ordering="created_at",
                id=99
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["status"] == 1
            assert params["limit"] == 50
            assert params["offset"] == 10
            assert params["search"] == "mapping"
            assert params["ordering"] == "created_at"
            assert params["id"] == 99

            # Verify no authentication headers
            headers = call_args[1]["headers"]
            assert "access-token" not in headers

    @pytest.mark.asyncio
    async def test_get_fair_projects_partial_params(self):
        """Test with only some optional parameters"""
        mock_response = Mock()
        mock_response.json.return_value = {}
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[0].endpoint

            await endpoint(status=0, search="AI")

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            def val(v):
                return v.default if isinstance(v, Query) else v

            assert params["status"] == 0
            assert params["search"] == "AI"
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0
            assert val(params["ordering"]) == "-created_at"
            assert val(params["id"]) is None

            # Verify headers are public (no auth token)
            headers = call_args[1]["headers"]
            assert "access-token" not in headers
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_fair_projects_http_status_error(self):
        """Test handling of HTTPStatusError from fAIr API"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[0].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint()

            assert exc_info.value.status_code == 404
            assert "Error from fAIr API" in exc_info.value.detail
            assert "Not Found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_fair_projects_generic_exception(self):
        """Test handling of generic exceptions"""
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection failed")
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[0].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint()

            assert exc_info.value.status_code == 500
            assert "Connection failed" in exc_info.value.detail
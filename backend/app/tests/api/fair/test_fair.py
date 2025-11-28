import pytest
import httpx
from unittest.mock import AsyncMock, Mock, patch
from fastapi import HTTPException
from fastapi.params import Query


class TestGetFairProjectsByUser:
    """Test suite for get_fair_projects_by_user function"""
    
    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_success_default_params(self):
        """Test successful request with default parameters and user_id"""
        mock_response_data = {
            "results": [{"id": 1, "name": "User AI Project"}],
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
            
            endpoint = router.routes[1].endpoint

            user_id = 23470445
            result = await endpoint(user_id=user_id)

            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/model/" in call_args[0][0]

            params = call_args[1]["params"]

            def val(v):
                return v.default if hasattr(v, "default") else v

            assert params["user"] == user_id
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0
            assert val(params["ordering"]) == "-created_at"
            assert "id" in params
            assert params["id"] is None or getattr(params["id"], "default", None) is None

            # Verify headers don't contain authentication
            headers = call_args[1]["headers"]
            assert "access-token" not in headers
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_with_all_params(self):
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
            endpoint = router.routes[1].endpoint

            user_id = 12345
            result = await endpoint(
                user_id=user_id,
                limit=50,
                offset=10,
                search="mapping",
                ordering="created_at",
                id=99
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["user"] == user_id
            assert params["limit"] == 50
            assert params["offset"] == 10
            assert params["search"] == "mapping"
            assert params["ordering"] == "created_at"
            assert params["id"] == 99

            # Verify no authentication headers
            headers = call_args[1]["headers"]
            assert "access-token" not in headers

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_partial_params(self):
        """Test with only some optional parameters"""
        mock_response = Mock()
        mock_response.json.return_value = {}
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[1].endpoint

            user_id = 99999
            await endpoint(user_id=user_id, search="buildings")

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            def val(v):
                return v.default if isinstance(v, Query) else v

            assert params["user"] == user_id
            assert params["search"] == "buildings"
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0
            assert val(params["ordering"]) == "-created_at"
            assert val(params["id"]) is None

            # Verify headers are public (no auth token)
            headers = call_args[1]["headers"]
            assert "access-token" not in headers
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_different_user_ids(self):
        """Test with different user IDs to ensure proper filtering"""
        mock_response = Mock()
        mock_response.json.return_value = {"results": [], "count": 0}
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[1].endpoint

            # Test with first user ID
            user_id_1 = 11111
            await endpoint(user_id=user_id_1)
            
            call_args_1 = mock_client.return_value.__aenter__.return_value.get.call_args
            assert call_args_1[1]["params"]["user"] == user_id_1

            # Test with second user ID
            user_id_2 = 23470445
            await endpoint(user_id=user_id_2)
            
            call_args_2 = mock_client.return_value.__aenter__.return_value.get.call_args
            assert call_args_2[1]["params"]["user"] == user_id_2

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_http_status_error(self):
        """Test handling of HTTPStatusError from fAIr API"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "User not found"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[1].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user_id=23470445)

            assert exc_info.value.status_code == 404
            assert "Error from fAIr API" in exc_info.value.detail
            assert "User not found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_generic_exception(self):
        """Test handling of generic exceptions"""
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection timeout")
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[1].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user_id=23470445)

            assert exc_info.value.status_code == 500
            assert "Connection timeout" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_empty_results(self):
        """Test when user has no projects"""
        mock_response_data = {
            "results": [],
            "count": 0,
            "next": None,
            "previous": None
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[1].endpoint

            result = await endpoint(user_id=99999)

            assert result == mock_response_data
            assert result["count"] == 0
            assert len(result["results"]) == 0

    @pytest.mark.asyncio
    async def test_get_fair_projects_by_user_pagination(self):
        """Test pagination with user filter"""
        mock_response = Mock()
        mock_response.json.return_value = {"results": [], "count": 0}
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[1].endpoint

            user_id = 23470445
            await endpoint(user_id=user_id, limit=10, offset=30)

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["user"] == user_id
            assert params["limit"] == 10
            assert params["offset"] == 30
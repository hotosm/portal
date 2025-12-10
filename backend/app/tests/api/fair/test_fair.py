# portal/backend/app/tests/api/fair/test_fair.py

"""Tests for fAIr API endpoints."""

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

class TestGetFairModelsByUser:
    """Test suite for get_fair_models_by_user function"""
    
    @pytest.mark.asyncio
    async def test_get_models_by_user_success_default_params(self):
        """Test successful request with default parameters"""
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
            # Get the second endpoint (index 1)
            endpoint = router.routes[1].endpoint

            result = await endpoint(user_id=23470445)

            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/model/" in call_args[0][0]

            params = call_args[1]["params"]
            
            def val(v):
                return v.default if hasattr(v, "default") else v
            
            assert params["user"] == 23470445
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0
            assert val(params["ordering"]) == "-created_at"

            # Verify headers don't contain authentication
            headers = call_args[1]["headers"]
            assert "access-token" not in headers
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_models_by_user_with_all_params(self):
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

            result = await endpoint(
                user_id=23470445,
                limit=50,
                offset=10,
                search="mapping",
                ordering="created_at",
                id=99
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["user"] == 23470445
            assert params["limit"] == 50
            assert params["offset"] == 10
            assert params["search"] == "mapping"
            assert params["ordering"] == "created_at"
            assert params["id"] == 99

    @pytest.mark.asyncio
    async def test_get_models_by_user_http_error(self):
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
                await endpoint(user_id=99999)

            assert exc_info.value.status_code == 404
            assert "Error from fAIr API" in exc_info.value.detail


class TestGetFairDatasetsByUser:
    """Test suite for get_fair_datasets_by_user function"""
    
    @pytest.mark.asyncio
    async def test_get_datasets_by_user_success_default_params(self):
        """Test successful request with default parameters"""
        mock_response_data = {
            "results": [{"id": 1, "name": "User Dataset"}],
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
            # Get the third endpoint (index 2)
            endpoint = router.routes[2].endpoint

            result = await endpoint(user_id=23470445)

            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/dataset/" in call_args[0][0]

            params = call_args[1]["params"]
            
            def val(v):
                return v.default if hasattr(v, "default") else v
            
            assert params["user"] == 23470445
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0
            assert val(params["ordering"]) == "-created_at"

            # Verify headers don't contain authentication
            headers = call_args[1]["headers"]
            assert "access-token" not in headers
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_datasets_by_user_with_all_params(self):
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
            endpoint = router.routes[2].endpoint

            result = await endpoint(
                user_id=23470445,
                limit=50,
                offset=10,
                ordering="created_at",
                id=99
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["user"] == 23470445
            assert params["limit"] == 50
            assert params["offset"] == 10
            assert params["ordering"] == "created_at"
            assert params["id"] == 99

    @pytest.mark.asyncio
    async def test_get_datasets_by_user_http_error(self):
        """Test handling of HTTPStatusError from fAIr API"""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal server error"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[2].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user_id=23470445)

            assert exc_info.value.status_code == 500
            assert "Error from fAIr API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_datasets_by_user_generic_exception(self):
        """Test handling of generic exceptions"""
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Network error")
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[2].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user_id=23470445)

            assert exc_info.value.status_code == 500
            assert "Network error" in exc_info.value.detail


class TestGetMyFairModels:
    """Test suite for get_my_fair_models function (authenticated endpoint)"""

    @pytest.mark.asyncio
    async def test_get_my_models_success(self):
        """Test successful request with mocked authentication"""
        mock_response_data = {
            "results": [{"id": 1, "name": "My AI Model"}],
            "count": 1
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        # Mock OSM connection with osm_user_id
        mock_osm = Mock()
        mock_osm.osm_user_id = 23470445

        # Mock Hanko user
        mock_user = Mock()
        mock_user.id = "test-user-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            # Get the /me/models endpoint (index 3)
            endpoint = router.routes[3].endpoint

            result = await endpoint(user=mock_user, osm=mock_osm)

            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/model/" in call_args[0][0]

            params = call_args[1]["params"]

            def val(v):
                return v.default if hasattr(v, "default") else v

            # Verify it uses the OSM user ID from the mocked connection
            assert params["user"] == 23470445
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0

    @pytest.mark.asyncio
    async def test_get_my_models_with_params(self):
        """Test with optional parameters"""
        mock_response_data = {"results": [], "count": 0}

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        mock_osm = Mock()
        mock_osm.osm_user_id = 12345

        mock_user = Mock()
        mock_user.id = "test-user-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[3].endpoint

            result = await endpoint(
                user=mock_user,
                osm=mock_osm,
                limit=50,
                offset=10,
                search="test",
                ordering="created_at",
                id=99
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["user"] == 12345
            assert params["limit"] == 50
            assert params["offset"] == 10
            assert params["search"] == "test"
            assert params["ordering"] == "created_at"
            assert params["id"] == 99


class TestGetMyFairDatasets:
    """Test suite for get_my_fair_datasets function (authenticated endpoint)"""

    @pytest.mark.asyncio
    async def test_get_my_datasets_success(self):
        """Test successful request with mocked authentication"""
        mock_response_data = {
            "results": [{"id": 1, "name": "My Dataset"}],
            "count": 1
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        mock_osm = Mock()
        mock_osm.osm_user_id = 23470445

        mock_user = Mock()
        mock_user.id = "test-user-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            # Get the /me/datasets endpoint (index 4)
            endpoint = router.routes[4].endpoint

            result = await endpoint(user=mock_user, osm=mock_osm)

            assert result == mock_response_data
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/dataset/" in call_args[0][0]

            params = call_args[1]["params"]

            def val(v):
                return v.default if hasattr(v, "default") else v

            assert params["user"] == 23470445
            assert val(params["limit"]) == 20
            assert val(params["offset"]) == 0

    @pytest.mark.asyncio
    async def test_get_my_datasets_with_params(self):
        """Test with optional parameters"""
        mock_response_data = {"results": [], "count": 0}

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        mock_osm = Mock()
        mock_osm.osm_user_id = 99999

        mock_user = Mock()
        mock_user.id = "test-user-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[4].endpoint

            result = await endpoint(
                user=mock_user,
                osm=mock_osm,
                limit=100,
                offset=20,
                ordering="name",
                id=5
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["user"] == 99999
            assert params["limit"] == 100
            assert params["offset"] == 20
            assert params["ordering"] == "name"
            assert params["id"] == 5

    @pytest.mark.asyncio
    async def test_get_my_datasets_http_error(self):
        """Test handling of HTTPStatusError"""
        mock_response = Mock()
        mock_response.status_code = 503
        mock_response.text = "Service unavailable"

        mock_osm = Mock()
        mock_osm.osm_user_id = 12345

        mock_user = Mock()
        mock_user.id = "test-user-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import router
            endpoint = router.routes[4].endpoint

            with pytest.raises(HTTPException) as exc_info:
                await endpoint(user=mock_user, osm=mock_osm)

            assert exc_info.value.status_code == 503
            assert "Error from fAIr API" in exc_info.value.detail
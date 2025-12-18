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

        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
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
        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
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

            from app.api.routes.fair.fair import get_fair_models_by_user

            result = await get_fair_models_by_user(user_id=23470445)

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

            from app.api.routes.fair.fair import get_fair_models_by_user

            result = await get_fair_models_by_user(
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

            from app.api.routes.fair.fair import get_fair_models_by_user

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_models_by_user(user_id=99999)

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

            from app.api.routes.fair.fair import get_fair_datasets_by_user

            result = await get_fair_datasets_by_user(user_id=23470445)

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

            from app.api.routes.fair.fair import get_fair_datasets_by_user

            result = await get_fair_datasets_by_user(
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

        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import get_fair_datasets_by_user

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_datasets_by_user(user_id=23470445)

            assert exc_info.value.status_code == 500
            assert "Error from fAIr API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_datasets_by_user_generic_exception(self):
        """Test handling of generic exceptions"""
        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Network error")
            )

            from app.api.routes.fair.fair import get_fair_datasets_by_user

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_datasets_by_user(user_id=23470445)

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

            from app.api.routes.fair.fair import get_my_fair_models

            result = await get_my_fair_models(user=mock_user, osm=mock_osm)

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

            from app.api.routes.fair.fair import get_my_fair_models

            result = await get_my_fair_models(
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

            from app.api.routes.fair.fair import get_my_fair_datasets

            result = await get_my_fair_datasets(user=mock_user, osm=mock_osm)

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

            from app.api.routes.fair.fair import get_my_fair_datasets

            result = await get_my_fair_datasets(
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

            from app.api.routes.fair.fair import get_my_fair_datasets

            with pytest.raises(HTTPException) as exc_info:
                await get_my_fair_datasets(user=mock_user, osm=mock_osm)

            assert exc_info.value.status_code == 503
            assert "Error from fAIr API" in exc_info.value.detail


class TestGetFairModelsCentroids:
    """Test suite for get_fair_models_centroids function"""

    @pytest.mark.asyncio
    async def test_get_centroids_success(self):
        """Test successful request for model centroids"""
        mock_centroids_data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [85.52, 27.63]
                    },
                    "properties": {"mid": 3}
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [90.12, 23.45]
                    },
                    "properties": {"mid": 38}
                }
            ]
        }

        mock_models_data = {
            "results": [
                {"id": 3, "name": "Building Model Banepa"},
                {"id": 38, "name": "Road Model Nepal"}
            ],
            "next": None
        }

        mock_centroids_response = Mock()
        mock_centroids_response.json.return_value = mock_centroids_data
        mock_centroids_response.raise_for_status = Mock()

        mock_models_response = Mock()
        mock_models_response.json.return_value = mock_models_data
        mock_models_response.raise_for_status = Mock()

        # Create a mock that returns different responses based on URL
        async def mock_get(url, *args, **kwargs):
            if "/models/centroid/" in url:
                return mock_centroids_response
            elif "/model/" in url:
                return mock_models_response
            return mock_centroids_response

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(side_effect=mock_get)

            from app.api.routes.fair.fair import get_fair_models_centroids

            result = await get_fair_models_centroids()

            assert result["type"] == "FeatureCollection"
            assert len(result["features"]) == 2
            # Check that names were enriched
            assert result["features"][0]["properties"]["mid"] == 3
            assert result["features"][0]["properties"].get("name") == "Building Model Banepa"
            assert result["features"][1]["properties"]["mid"] == 38
            assert result["features"][1]["properties"].get("name") == "Road Model Nepal"

    @pytest.mark.asyncio
    async def test_get_centroids_empty_response(self):
        """Test handling of empty FeatureCollection"""
        mock_response_data = {
            "type": "FeatureCollection",
            "features": []
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import get_fair_models_centroids

            result = await get_fair_models_centroids()

            assert result["type"] == "FeatureCollection"
            assert len(result["features"]) == 0

    @pytest.mark.asyncio
    async def test_get_centroids_http_error(self):
        """Test handling of HTTPStatusError from fAIr API"""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal server error"

        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import get_fair_models_centroids

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_models_centroids()

            assert exc_info.value.status_code == 500
            assert "Error from fAIr API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_centroids_generic_exception(self):
        """Test handling of generic exceptions"""
        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection timeout")
            )

            from app.api.routes.fair.fair import get_fair_models_centroids

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_models_centroids()

            assert exc_info.value.status_code == 500
            assert "Connection timeout" in exc_info.value.detail


class TestGetFairModelDetail:
    """Test suite for get_fair_model_detail function"""

    @pytest.mark.asyncio
    async def test_get_model_detail_success(self):
        """Test successful request for model details"""
        mock_response_data = {
            "id": 3,
            "name": "Building Model Banepa",
            "description": "A model for detecting buildings",
            "accuracy": 88.9,
            "status": 0,
            "base_model": "RAMP",
            "published_training": 22,
            "user": {"osm_id": 12345, "username": "mapper"},
            "dataset": {"id": 1, "name": "Banepa Dataset", "source_imagery": "maxar"},
            "created_at": "2023-01-01T00:00:00Z",
            "last_modified": "2023-06-01T00:00:00Z",
            "thumbnail_url": "https://example.com/thumb.png"
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import get_fair_model_detail

            result = await get_fair_model_detail(mid=3)

            assert result == mock_response_data
            assert result["id"] == 3
            assert result["name"] == "Building Model Banepa"
            assert result["accuracy"] == 88.9
            assert result["user"]["username"] == "mapper"

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert "/model/3/" in call_args[0][0]

            headers = call_args[1]["headers"]
            assert headers["accept"] == "application/json"

    @pytest.mark.asyncio
    async def test_get_model_detail_with_null_fields(self):
        """Test handling of model with null optional fields"""
        mock_response_data = {
            "id": 5,
            "name": "Test Model",
            "description": None,
            "accuracy": None,
            "status": 1,
            "base_model": "RAMP",
            "published_training": None,
            "user": {"osm_id": 99999, "username": "testuser"},
            "dataset": None,
            "created_at": "2023-02-01T00:00:00Z",
            "last_modified": "2023-02-01T00:00:00Z",
            "thumbnail_url": None
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.fair.fair import get_fair_model_detail

            result = await get_fair_model_detail(mid=5)

            assert result == mock_response_data
            assert result["id"] == 5
            assert result["description"] is None
            assert result["dataset"] is None

    @pytest.mark.asyncio
    async def test_get_model_detail_not_found(self):
        """Test handling of 404 when model doesn't exist"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "Model not found"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import get_fair_model_detail

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_model_detail(mid=99999)

            assert exc_info.value.status_code == 404
            assert "Error from fAIr API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_model_detail_server_error(self):
        """Test handling of server errors"""
        mock_response = Mock()
        mock_response.status_code = 503
        mock_response.text = "Service unavailable"

        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Error from fAIr API",
                    request=Mock(),
                    response=mock_response
                )
            )

            from app.api.routes.fair.fair import get_fair_model_detail

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_model_detail(mid=3)

            assert exc_info.value.status_code == 503
            assert "Error from fAIr API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_model_detail_generic_exception(self):
        """Test handling of generic exceptions"""
        with patch("app.api.routes.fair.fair.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Network error")
            )

            from app.api.routes.fair.fair import get_fair_model_detail

            with pytest.raises(HTTPException) as exc_info:
                await get_fair_model_detail(mid=3)

            assert exc_info.value.status_code == 500
            assert "Network error" in exc_info.value.detail
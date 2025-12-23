# portal/backend/app/tests/api/open_aerial_map/test_open_aerial_map.py

"""Tests for OpenAerialMap user endpoint."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_success(client: AsyncClient):
    """
    Test that get_imagery_by_user returns 200 with correct structure.
    
    This test demonstrates:
    - User-specific imagery retrieval
    - Testing path parameters
    - Default query parameters
    """
    mock_response = {
        "meta": {
            "provided_by": "OpenAerialMap",
            "license": "CC-BY 4.0",
            "page": 1,
            "limit": 10,
            "found": 2
        },
        "results": [
            {
                "_id": "691e75d9628460062aec9418",
                "title": "Spanish EMT Falmouth",
                "provider": "Atlas Logistique / UNDAC",
                "user": {
                    "_id": "6918b688d06a6f5c0a953e2e",
                    "name": "Atlas DAK"
                }
            },
            {
                "_id": "6918cd3e6bc7378f0aa8c66e",
                "title": "Landslide Content Gap",
                "provider": "Atlas Logistique / UNDAC",
                "user": {
                    "_id": "6918b688d06a6f5c0a953e2e",
                    "name": "Atlas DAK"
                }
            }
        ]
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/user/6918b688d06a6f5c0a953e2e")
    
    assert response.status_code == 200
    data = response.json()
    assert "meta" in data
    assert "results" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) == 2


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_with_custom_params(client: AsyncClient):
    """Test that custom query parameters are properly sent to external API."""
    mock_response = {
        "meta": {"page": 2, "limit": 20, "found": 5},
        "results": []
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get(
        "/api/open-aerial-map/user/6918b688d06a6f5c0a953e2e",
        params={
            "limit": 20,
            "page": 2,
            "order_by": "uploaded_at",
            "sort": "asc"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "results" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_default_params(client: AsyncClient):
    """Test that default parameters are applied correctly."""
    mock_response = {
        "meta": {
            "provided_by": "OpenAerialMap",
            "page": 1,
            "limit": 10,
            "found": 1
        },
        "results": []
    }
    
    route = respx.get("https://api.openaerialmap.org/meta")
    route.mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/user/test_user_123")
    
    assert response.status_code == 200
    # Verify the request was made with correct default params
    assert route.called
    request = route.calls.last.request
    params = dict(request.url.params)
    assert params["user"] == "test_user_123"
    assert params["limit"] == "10"
    assert params["page"] == "1"
    assert params["order_by"] == "acquisition_end"
    assert params["sort"] == "desc"


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_empty_results(client: AsyncClient):
    """Test handling when user has no imagery."""
    mock_response = {
        "meta": {
            "provided_by": "OpenAerialMap",
            "page": 1,
            "limit": 10,
            "found": 0
        },
        "results": []
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/user/nonexistent_user")
    
    assert response.status_code == 200
    data = response.json()
    assert data["results"] == []
    assert data["meta"]["found"] == 0


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_http_error(client: AsyncClient):
    """Test handling of HTTP errors from external API."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(500, text="Internal Server Error"))
    
    response = await client.get("/api/open-aerial-map/user/test_user")
    
    assert response.status_code == 500
    assert "Error from OpenAerialMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_connection_error(client: AsyncClient):
    """Test handling of connection errors to external API."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(side_effect=httpx.RequestError("Connection failed"))
    
    response = await client.get("/api/open-aerial-map/user/test_user")
    
    assert response.status_code == 500
    assert "Connection failed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_imagery_by_user_invalid_limit(client: AsyncClient):
    """Test validation of limit parameter (must be between 1 and 100)."""
    response = await client.get("/api/open-aerial-map/user/test_user?limit=0")
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_imagery_by_user_invalid_limit_too_high(client: AsyncClient):
    """Test validation of limit parameter when exceeding maximum."""
    response = await client.get("/api/open-aerial-map/user/test_user?limit=101")
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_imagery_by_user_invalid_page(client: AsyncClient):
    """Test validation of page parameter (must be >= 1)."""
    response = await client.get("/api/open-aerial-map/user/test_user?page=0")
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_imagery_by_user_invalid_sort(client: AsyncClient):
    """Test validation of sort parameter (must be 'asc' or 'desc')."""
    response = await client.get("/api/open-aerial-map/user/test_user?sort=invalid")
    
    assert response.status_code == 422


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_response_structure(client: AsyncClient):
    """Test that user imagery response has all required fields."""
    mock_response = {
        "meta": {
            "provided_by": "OpenAerialMap",
            "license": "CC-BY 4.0",
            "page": 1,
            "limit": 10,
            "found": 1
        },
        "results": [
            {
                "_id": "test_id",
                "title": "Test Image",
                "provider": "Test Provider",
                "acquisition_start": "2025-11-18T05:00:00.000Z",
                "acquisition_end": "2025-11-18T06:00:00.000Z"
            }
        ]
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/user/6918b688d06a6f5c0a953e2e")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify meta structure
    assert "meta" in data
    assert "provided_by" in data["meta"]
    assert "page" in data["meta"]
    assert "limit" in data["meta"]
    assert "found" in data["meta"]
    
    # Verify results structure
    assert "results" in data
    assert len(data["results"]) == 1
    assert "title" in data["results"][0]
    assert "provider" in data["results"][0]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_ordering(client: AsyncClient):
    """Test that ordering by different fields works correctly."""
    mock_response = {
        "meta": {"page": 1, "limit": 10, "found": 2},
        "results": [
            {
                "_id": "1",
                "uploaded_at": "2025-11-20T01:58:49.320Z"
            },
            {
                "_id": "2",
                "uploaded_at": "2025-11-15T18:58:05.999Z"
            }
        ]
    }
    
    route = respx.get("https://api.openaerialmap.org/meta")
    route.mock(return_value=Response(200, json=mock_response))
    
    response = await client.get(
        "/api/open-aerial-map/user/test_user",
        params={"order_by": "uploaded_at"}
    )
    
    assert response.status_code == 200
    # Verify order_by parameter was sent
    request = route.calls.last.request
    params = dict(request.url.params)
    assert params["order_by"] == "uploaded_at"


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_multiple_results_structure(client):
    """Test response structure with multiple imagery results."""

    mock_response = {
        "meta": {
            "provided_by": "OpenAerialMap",
            "license": "CC-BY 4.0",
            "website": "http://beta.openaerialmap.org",
            "page": 1,
            "limit": 10,
            "found": 2
        },
        "results": [
            {
                "_id": "691e75d9628460062aec9418",
                "uuid": "https://oin-hotosm-temp.s3.us-east-1.amazonaws.com/test1.tif",
                "title": "Spanish EMT Falmouth",
                "projection": "EPSG:32618",
                "bbox": [-77.660693, 18.494869, -77.658397, 18.497357],
                "gsd": 0.019,
                "file_size": 39317987,
                "acquisition_start": "2025-11-18T05:00:00.000Z",
                "acquisition_end": "2025-11-18T06:00:00.000Z",
                "platform": "uav",
                "provider": "Atlas Logistique / UNDAC"
            },
            {
                "_id": "6918cd3e6bc7378f0aa8c66e",
                "uuid": "https://oin-hotosm-temp.s3.us-east-1.amazonaws.com/test2.tif",
                "title": "Landslide Content Gap",
                "projection": "EPSG:32618",
                "bbox": [-76.684496, 18.039953, -76.683378, 18.04103],
                "gsd": 0.01,
                "file_size": 43233503,
                "acquisition_start": "2025-11-10T05:00:00.000Z",
                "acquisition_end": "2025-11-10T06:00:00.000Z",
                "platform": "uav",
                "provider": "Atlas Logistique / UNDAC"
            }
        ]
    }

    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get(
        "/api/open-aerial-map/user/6918b688d06a6f5c0a953e2e"
    )

    assert response.status_code == 200

    data = response.json()

    # Verify structure
    assert "meta" in data
    assert "results" in data
    assert data["meta"]["found"] == 2
    assert len(data["results"]) == 2

    # First
    first = data["results"][0]
    assert first["_id"] == "691e75d9628460062aec9418"
    assert first["title"] == "Spanish EMT Falmouth"
    assert first["gsd"] == 0.019
    assert first["platform"] == "uav"

    # Second
    second = data["results"][1]
    assert second["_id"] == "6918cd3e6bc7378f0aa8c66e"
    assert second["title"] == "Landslide Content Gap"
    assert second["gsd"] == 0.01


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_unexpected_error(client: AsyncClient):
    """Test handling of unexpected errors in user endpoint."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(side_effect=Exception("Unexpected error"))
    
    response = await client.get("/api/open-aerial-map/user/test_user")
    
    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_with_different_order_fields(client: AsyncClient):
    """Test ordering by various fields like acquisition_start, title, gsd."""
    mock_response = {
        "meta": {"page": 1, "limit": 10, "found": 1},
        "results": [
            {
                "_id": "test_id",
                "title": "Test",
                "gsd": 0.5,
                "acquisition_start": "2025-01-01T00:00:00.000Z"
            }
        ]
    }
    
    order_fields = ["acquisition_start", "acquisition_end", "uploaded_at", "title", "gsd"]
    
    for field in order_fields:
        route = respx.get("https://api.openaerialmap.org/meta")
        route.mock(return_value=Response(200, json=mock_response))
        
        response = await client.get(
            "/api/open-aerial-map/user/test_user",
            params={"order_by": field}
        )
        
        assert response.status_code == 200
        request = route.calls.last.request
        params = dict(request.url.params)
        assert params["order_by"] == field


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_pagination(client: AsyncClient):
    """Test pagination functionality."""
    # Mock first page
    mock_page_1 = {
        "meta": {"page": 1, "limit": 5, "found": 12},
        "results": [{"_id": f"id_{i}", "title": f"Image {i}"} for i in range(1, 6)]
    }
    
    # Mock second page
    mock_page_2 = {
        "meta": {"page": 2, "limit": 5, "found": 12},
        "results": [{"_id": f"id_{i}", "title": f"Image {i}"} for i in range(6, 11)]
    }
    
    route = respx.get("https://api.openaerialmap.org/meta")
    
    # Test page 1
    route.mock(return_value=Response(200, json=mock_page_1))
    response_1 = await client.get(
        "/api/open-aerial-map/user/test_user",
        params={"limit": 5, "page": 1}
    )
    
    assert response_1.status_code == 200
    data_1 = response_1.json()
    assert data_1["meta"]["page"] == 1
    assert len(data_1["results"]) == 5
    
    # Test page 2
    route.mock(return_value=Response(200, json=mock_page_2))
    response_2 = await client.get(
        "/api/open-aerial-map/user/test_user",
        params={"limit": 5, "page": 2}
    )
    
    assert response_2.status_code == 200
    data_2 = response_2.json()
    assert data_2["meta"]["page"] == 2
    assert len(data_2["results"]) == 5


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_not_found_status(client: AsyncClient):
    """Test handling when external API returns 404."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(404, text="User not found"))
    
    response = await client.get("/api/open-aerial-map/user/nonexistent_user_999")
    
    assert response.status_code == 404
    assert "Error from OpenAerialMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_user_timeout_error(client: AsyncClient):
    """Test handling of timeout errors."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(side_effect=httpx.TimeoutException("Request timeout"))

    response = await client.get("/api/open-aerial-map/user/test_user")

    assert response.status_code == 500
    assert "Request timeout" in response.json()["detail"]


# Tests for /user/me endpoint (authenticated) - queries OAM API by email
class TestGetMyImagery:
    """Test suite for get_my_imagery endpoint (authenticated, filters by email)."""

    @pytest.mark.asyncio
    async def test_get_my_imagery_success(self):
        """Test successful request with mocked authentication."""
        from unittest.mock import Mock, AsyncMock, patch

        mock_response_data = {
            "meta": {
                "provided_by": "OpenAerialMap",
                "license": "CC-BY 4.0",
                "page": 1,
                "limit": 100,
                "found": 2
            },
            "results": [
                {
                    "_id": "691e75d9628460062aec9418",
                    "title": "Test Imagery 1",
                    "provider": "Test Provider",
                    "contact": "test@example.com"
                },
                {
                    "_id": "6918cd3e6bc7378f0aa8c66e",
                    "title": "Test Imagery 2",
                    "provider": "Test Provider",
                    "contact": "test@example.com"
                }
            ]
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        # Mock Hanko user
        mock_user = Mock()
        mock_user.id = "test-hanko-uuid-123"
        mock_user.email = "test@example.com"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.open_aerial_map.open_aerial_map import get_my_imagery

            result = await get_my_imagery(user=mock_user)

            assert result == mock_response_data
            assert result["meta"]["found"] == 2
            assert len(result["results"]) == 2
            mock_client.return_value.__aenter__.return_value.get.assert_called_once()

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            # Verify the contact filter uses the user's email
            assert params["contact"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_my_imagery_with_pagination(self):
        """Test with custom pagination parameters."""
        from unittest.mock import Mock, AsyncMock, patch

        mock_response_data = {
            "meta": {"page": 2, "limit": 50, "found": 100},
            "results": []
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"
        mock_user.email = "test@example.com"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.open_aerial_map.open_aerial_map import get_my_imagery

            result = await get_my_imagery(
                user=mock_user,
                limit=50,
                page=2,
                order_by="uploaded_at",
                sort="asc"
            )

            assert result == mock_response_data

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]

            assert params["limit"] == 50
            assert params["page"] == 2
            assert params["order_by"] == "uploaded_at"
            assert params["sort"] == "asc"

    @pytest.mark.asyncio
    async def test_get_my_imagery_no_email(self):
        """Test error when user has no email."""
        from unittest.mock import Mock
        from fastapi import HTTPException

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"
        mock_user.email = None

        from app.api.routes.open_aerial_map.open_aerial_map import get_my_imagery

        with pytest.raises(HTTPException) as exc_info:
            await get_my_imagery(user=mock_user)

        assert exc_info.value.status_code == 400
        assert "email not available" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_my_imagery_api_error(self):
        """Test handling of OAM API errors."""
        from unittest.mock import Mock, AsyncMock, patch
        from fastapi import HTTPException

        mock_response = Mock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Server Error",
            request=Mock(),
            response=Mock(status_code=500, text="Internal Server Error")
        )

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"
        mock_user.email = "test@example.com"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.open_aerial_map.open_aerial_map import get_my_imagery

            with pytest.raises(HTTPException) as exc_info:
                await get_my_imagery(user=mock_user)

            assert exc_info.value.status_code == 500

    @pytest.mark.asyncio
    async def test_get_my_imagery_connection_error(self):
        """Test handling of connection errors."""
        from unittest.mock import Mock, AsyncMock, patch
        from fastapi import HTTPException

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"
        mock_user.email = "test@example.com"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection failed")
            )

            from app.api.routes.open_aerial_map.open_aerial_map import get_my_imagery

            with pytest.raises(HTTPException) as exc_info:
                await get_my_imagery(user=mock_user)

            assert exc_info.value.status_code == 500
            assert "Connection failed" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_my_imagery_empty_results(self):
        """Test when user has no imagery."""
        from unittest.mock import Mock, AsyncMock, patch

        mock_response_data = {
            "meta": {"page": 1, "limit": 100, "found": 0},
            "results": []
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = Mock()

        mock_user = Mock()
        mock_user.id = "user-with-no-imagery"
        mock_user.email = "nodata@example.com"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.open_aerial_map.open_aerial_map import get_my_imagery

            result = await get_my_imagery(user=mock_user)

            assert result["meta"]["found"] == 0
            assert result["results"] == []
"""Tests for OpenAerialMap API endpoints."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_success(client: AsyncClient):
    """
    Test that get_imagery_metadata returns 200 with correct structure.
    
    This test demonstrates:
    - Mocking external API calls
    - Testing GET endpoints
    - Verifying response status codes
    - Validating response JSON structure
    """
    mock_response = {
        "meta": {
            "provided_by": "OpenAerialMap",
            "license": "CC-BY 4.0",
            "page": 1,
            "limit": 10,
            "found": 18927
        },
        "results": [
            {
                "_id": "59e62b863d6412ef72209ae1",
                "title": "Test Image",
                "provider": "Test Provider"
            }
        ]
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/projects")
    
    assert response.status_code == 200
    data = response.json()
    assert "meta" in data
    assert "results" in data
    assert isinstance(data["results"], list)


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_response_structure(client: AsyncClient):
    """Test that imagery metadata response has all required fields."""
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
    
    response = await client.get("/api/open-aerial-map/projects")
    
    assert response.status_code == 200
    data = response.json()
    
    required_fields = ["meta", "results"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_with_optional_params(client: AsyncClient):
    """Test that optional query parameters are properly sent to external API."""
    mock_response = {
        "meta": {"page": 1, "limit": 20, "found": 5},
        "results": []
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get(
        "/api/open-aerial-map/projects",
        params={
            "limit": 20,
            "page": 2,
            "sort": "asc",
            "bbox": "-122.5,37.5,-122.0,38.0",
            "has_tiled": "true",
            "title": "Test",
            "provider": "TestProvider"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "results" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_http_error(client: AsyncClient):
    """Test handling of HTTP errors from external API."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(500, text="Internal Server Error"))
    
    response = await client.get("/api/open-aerial-map/projects")
    
    assert response.status_code == 500
    assert "Error from OpenAerialMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_connection_error(client: AsyncClient):
    """Test handling of connection errors to external API."""
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(side_effect=httpx.RequestError("Connection failed"))
    
    response = await client.get("/api/open-aerial-map/projects")
    
    assert response.status_code == 500
    assert "Connection failed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_imagery_metadata_invalid_limit(client: AsyncClient):
    """Test validation of limit parameter (must be between 1 and 100)."""
    response = await client.get("/api/open-aerial-map/projects?limit=0")
    
    # FastAPI query validation should reject this
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_imagery_metadata_invalid_page(client: AsyncClient):
    """Test validation of page parameter (must be >= 1)."""
    response = await client.get("/api/open-aerial-map/projects?page=0")
    
    # FastAPI query validation should reject this
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_imagery_metadata_invalid_sort(client: AsyncClient):
    """Test validation of sort parameter (must be 'asc' or 'desc')."""
    response = await client.get("/api/open-aerial-map/projects?sort=invalid")
    
    # FastAPI query validation should reject this
    assert response.status_code == 422


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_id_success(client: AsyncClient):
    """
    Test that get_imagery_by_id returns 200 with image metadata.
    """
    mock_response = {
        "_id": "59e62b863d6412ef72209ae1",
        "uuid": "http://oin-hotosm-temp.s3.amazonaws.com/test.tif",
        "title": "Test Image",
        "projection": "EPSG:4326",
        "bbox": [-80.42, -0.98, -80.41, -0.97],
        "gsd": 1.857e-07,
        "file_size": 47649982,
        "acquisition_start": "2016-04-27T05:00:00.000Z",
        "acquisition_end": "2016-04-28T17:00:03.000Z",
        "platform": "uav",
        "provider": "Test Provider"
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta/59e62b863d6412ef72209ae1"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/projects/59e62b863d6412ef72209ae1")
    
    assert response.status_code == 200
    data = response.json()
    assert "_id" in data
    assert "title" in data
    assert "provider" in data
    assert data["_id"] == "59e62b863d6412ef72209ae1"


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_id_response_structure(client: AsyncClient):
    """Test that imagery by ID response has expected fields."""
    mock_response = {
        "_id": "test123",
        "title": "Test",
        "provider": "Provider",
        "bbox": [-1, -1, 1, 1]
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta/test123"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/open-aerial-map/projects/test123")
    
    assert response.status_code == 200
    data = response.json()
    assert "_id" in data
    assert "title" in data
    assert "provider" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_id_not_found(client: AsyncClient):
    """Test handling of 404 when image doesn't exist."""
    respx.get(
        "https://api.openaerialmap.org/meta/nonexistent123"
    ).mock(return_value=Response(404, text="Not Found"))
    
    response = await client.get("/api/open-aerial-map/projects/nonexistent123")
    
    assert response.status_code == 404
    assert "Error from OpenAerialMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_id_http_error(client: AsyncClient):
    """Test handling of HTTP errors in imagery by ID endpoint."""
    respx.get(
        "https://api.openaerialmap.org/meta/test123"
    ).mock(return_value=Response(500, text="Internal Server Error"))
    
    response = await client.get("/api/open-aerial-map/projects/test123")
    
    assert response.status_code == 500
    assert "Error from OpenAerialMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_id_connection_error(client: AsyncClient):
    """Test handling of connection errors in imagery by ID endpoint."""
    respx.get(
        "https://api.openaerialmap.org/meta/test123"
    ).mock(side_effect=httpx.RequestError("Connection timeout"))
    
    response = await client.get("/api/open-aerial-map/projects/test123")
    
    assert response.status_code == 500
    assert "Connection timeout" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_by_id_unexpected_error(client: AsyncClient):
    """Test handling of unexpected errors in imagery by ID endpoint."""
    respx.get(
        "https://api.openaerialmap.org/meta/test123"
    ).mock(side_effect=Exception("Unexpected error"))
    
    response = await client.get("/api/open-aerial-map/projects/test123")
    
    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_with_gsd_filters(client: AsyncClient):
    """Test that GSD (resolution) filters are properly applied."""
    mock_response = {
        "meta": {"page": 1, "limit": 10, "found": 2},
        "results": []
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get(
        "/api/open-aerial-map/projects",
        params={
            "gsd_from": 0.1,
            "gsd_to": 0.5
        }
    )
    
    assert response.status_code == 200


@pytest.mark.asyncio
@respx.mock
async def test_get_imagery_metadata_with_date_filters(client: AsyncClient):
    """Test that acquisition date filters are properly applied."""
    mock_response = {
        "meta": {"page": 1, "limit": 10, "found": 3},
        "results": []
    }
    
    respx.get(
        "https://api.openaerialmap.org/meta"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get(
        "/api/open-aerial-map/projects",
        params={
            "acquisition_from": "2024-01-01",
            "acquisition_to": "2024-12-31"
        }
    )
    
    assert response.status_code == 200
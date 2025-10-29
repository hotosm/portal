"""Tests for Tasking Manager API endpoints."""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
import httpx


@pytest.mark.asyncio
async def test_get_tasking_manager_projects_success(client: AsyncClient):
    """
    Test that get_tasking_manager_projects returns 200 with correct structure.
    
    This test demonstrates:
    - Mocking external API calls
    - Testing GET endpoints
    - Verifying response status codes
    - Validating response JSON structure
    """
    mock_response = {
        "mapResults": {"features": []},
        "results": [
            {"projectId": 1, "name": "Test Project"}
        ],
        "pagination": {"total": 1}
    }
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response
        )
        mock_get.return_value.raise_for_status = AsyncMock()
        
        response = await client.get("/api/tasking-manager/projects")
        
        assert response.status_code == 200
        data = response.json()
        assert "mapResults" in data
        assert "results" in data
        assert "pagination" in data
        assert isinstance(data["results"], list)


@pytest.mark.asyncio
async def test_get_tasking_manager_projects_response_structure(client: AsyncClient):
    """Test that tasking manager projects response has all required fields."""
    mock_response = {
        "mapResults": {},
        "results": [],
        "pagination": {"total": 0}
    }
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response
        )
        mock_get.return_value.raise_for_status = AsyncMock()
        
        response = await client.get("/api/tasking-manager/projects")
        
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["mapResults", "results", "pagination"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"


@pytest.mark.asyncio
async def test_get_tasking_manager_projects_http_error(client: AsyncClient):
    """Test handling of HTTP errors from external API."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = AsyncMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        
        mock_get.return_value = mock_response
        mock_get.return_value.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Error", request=AsyncMock(), response=mock_response
        )
        
        response = await client.get("/api/tasking-manager/projects")
        
        assert response.status_code == 500
        assert "Error al consultar API de HOT OSM" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_tasking_manager_projects_connection_error(client: AsyncClient):
    """Test handling of connection errors to external API."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.side_effect = httpx.RequestError("Connection failed")
        
        response = await client.get("/api/tasking-manager/projects")
        
        assert response.status_code == 503
        assert "Error de conexión con API de HOT OSM" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_hotosm_countries_success(client: AsyncClient):
    """
    Test that get_hotosm_countries returns 200 with countries list.
    """
    mock_response = {
        "tags": ["Argentina", "Brazil", "Chile", "Colombia"]
    }
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response
        )
        mock_get.return_value.raise_for_status = AsyncMock()
        
        response = await client.get("/api/tasking-manager/countries")
        
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert isinstance(data["tags"], list)
        assert len(data["tags"]) > 0


@pytest.mark.asyncio
async def test_get_hotosm_countries_response_structure(client: AsyncClient):
    """Test that countries endpoint returns proper structure."""
    mock_response = {"tags": ["Argentina"]}
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response
        )
        mock_get.return_value.raise_for_status = AsyncMock()
        
        response = await client.get("/api/tasking-manager/countries")
        
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert isinstance(data["tags"], list)


@pytest.mark.asyncio
async def test_get_hotosm_countries_http_error(client: AsyncClient):
    """Test handling of HTTP errors in countries endpoint."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = AsyncMock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"
        
        mock_get.return_value = mock_response
        mock_get.return_value.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Error", request=AsyncMock(), response=mock_response
        )
        
        response = await client.get("/api/tasking-manager/countries")
        
        assert response.status_code == 404
        assert "Error querying HOT OSM API" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_hotosm_countries_connection_error(client: AsyncClient):
    """Test handling of connection errors in countries endpoint."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.side_effect = httpx.RequestError("Network error")
        
        response = await client.get("/api/tasking-manager/countries")
        
        assert response.status_code == 503
        assert "Connection error with HOT OSM API" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_success(client: AsyncClient):
    """
    Test that get_tasking_manager_project_by_id returns 200 with filtered data.
    """
    mock_response = {
        "organisationName": "Test Organization",
        "organisationSlug": "test-org",
        "projectInfo": {"name": "Test Project"},
        "projectInfoLocales": [{"locale": "en"}],
        "created": "2024-01-01T00:00:00Z",
        "percentMapped": 75,
        "percentValidated": 50,
        "percentBadImagery": 5,
        "extraField": "should not be returned"
    }
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response
        )
        mock_get.return_value.raise_for_status = AsyncMock()
        
        response = await client.get("/api/tasking-manager/projectid/123")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify filtered fields are present
        assert "organisationName" in data
        assert "organisationSlug" in data
        assert "projectInfo" in data
        assert "projectInfoLocales" in data
        assert "created" in data
        assert "percentMapped" in data
        assert "percentValidated" in data
        assert "percentBadImagery" in data
        
        # Verify extra fields are not included
        assert "extraField" not in data


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_filtered_fields(client: AsyncClient):
    """Test that only specified fields are returned."""
    mock_response = {
        "organisationName": "Org",
        "organisationSlug": "org",
        "projectInfo": {},
        "projectInfoLocales": [],
        "created": "2024-01-01",
        "percentMapped": 100,
        "percentValidated": 100,
        "percentBadImagery": 0,
        "unwantedField1": "value1",
        "unwantedField2": "value2"
    }
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response
        )
        mock_get.return_value.raise_for_status = AsyncMock()
        
        response = await client.get("/api/tasking-manager/projectid/1")
        
        assert response.status_code == 200
        data = response.json()
        
        # Only 8 filtered fields should be present
        assert len(data) == 8
        assert "unwantedField1" not in data
        assert "unwantedField2" not in data


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_not_found(client: AsyncClient):
    """Test handling of 404 when project doesn't exist."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = AsyncMock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"
        
        mock_get.return_value = mock_response
        mock_get.return_value.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Error", request=AsyncMock(), response=mock_response
        )
        
        response = await client.get("/api/tasking-manager/projectid/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_invalid_id(client: AsyncClient):
    """Test validation of project ID parameter (must be > 0)."""
    response = await client.get("/api/tasking-manager/projectid/0")
    
    # FastAPI path validation should reject this
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_connection_error(client: AsyncClient):
    """Test handling of connection errors in project by ID endpoint."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.side_effect = httpx.RequestError("Connection timeout")
        
        response = await client.get("/api/tasking-manager/projectid/123")
        
        assert response.status_code == 503
        assert "Connection error with HOT OSM API" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_unexpected_error(client: AsyncClient):
    """Test handling of unexpected errors in project by ID endpoint."""
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_get.side_effect = Exception("Unexpected error")
        
        response = await client.get("/api/tasking-manager/projectid/123")
        
        assert response.status_code == 500
        assert "Unexpected error" in response.json()["detail"]
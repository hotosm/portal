"""Tests for FMTM API endpoints."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_success(client: AsyncClient):
    """
    Test that get_fmtm_projects returns 200 with correct structure.
    
    This test demonstrates:
    - Mocking external API calls
    - Testing GET endpoints
    - Verifying response status codes
    - Validating response JSON structure
    """
    mock_response = [
        {"id": 1, "name": "Test Project 1"},
        {"id": 2, "name": "Test Project 2"}
    ]
    
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["id"] == 1
    assert data[0]["name"] == "Test Project 1"


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_response_structure(client: AsyncClient):
    """Test that FMTM projects response has expected list structure."""
    mock_response = [
        {
            "id": 1,
            "name": "Project Name",
            "description": "Project Description",
            "status": "ACTIVE"
        }
    ]
    
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "name" in data[0]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_empty_list(client: AsyncClient):
    """Test handling of empty projects list."""
    mock_response = []
    
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_http_error(client: AsyncClient):
    """Test handling of HTTP errors from external API."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(return_value=Response(500, text="Internal Server Error"))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 500
    assert "Error querying FMTM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_connection_error(client: AsyncClient):
    """Test handling of connection errors to external API."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(side_effect=httpx.RequestError("Connection failed"))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 503
    assert "FMTM API connection error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_unauthorized(client: AsyncClient):
    """Test handling of 401 Unauthorized error."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(return_value=Response(401, text="Unauthorized"))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 401
    assert "Error querying FMTM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_success(client: AsyncClient):
    """
    Test that get_fmtm_project_by_id returns 200 with complete data.
    """
    mock_response = {
        "id": 443,
        "name": "Test Project",
        "description": "Test Description",
        "status": "ACTIVE",
        "created": "2024-01-01T00:00:00Z",
        "author": {"username": "test_user"},
        "priority": "MEDIUM"
    }
    
    respx.get(
        "https://api.fmtm.hotosm.org/projects/443"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/field-tm/projectid/443")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == 443
    assert data["name"] == "Test Project"
    assert data["description"] == "Test Description"
    assert "status" in data
    assert "created" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_complete_response(client: AsyncClient):
    """Test that project by ID returns all fields from API."""
    mock_response = {
        "id": 1,
        "name": "Full Project",
        "description": "Description",
        "status": "ACTIVE",
        "priority": "HIGH",
        "metadata": {"key": "value"}
    }
    
    respx.get(
        "https://api.fmtm.hotosm.org/projects/1"
    ).mock(return_value=Response(200, json=mock_response))
    
    response = await client.get("/api/field-tm/projectid/1")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify all fields are present (no filtering)
    assert "id" in data
    assert "name" in data
    assert "description" in data
    assert "status" in data
    assert "priority" in data
    assert "metadata" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_not_found(client: AsyncClient):
    """Test handling of 404 when project doesn't exist."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/99999"
    ).mock(return_value=Response(404, text="Not Found"))
    
    response = await client.get("/api/field-tm/projectid/99999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    assert "99999" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_invalid_id(client: AsyncClient):
    """Test validation of project ID parameter (must be > 0)."""
    response = await client.get("/api/field-tm/projectid/0")
    
    # FastAPI path validation should reject this
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_negative_id(client: AsyncClient):
    """Test validation rejects negative project IDs."""
    response = await client.get("/api/field-tm/projectid/-1")
    
    # FastAPI path validation should reject this
    assert response.status_code == 422


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_connection_error(client: AsyncClient):
    """Test handling of connection errors in project by ID endpoint."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/443"
    ).mock(side_effect=httpx.RequestError("Connection timeout"))
    
    response = await client.get("/api/field-tm/projectid/443")
    
    assert response.status_code == 503
    assert "FMTM API connection error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_unexpected_error(client: AsyncClient):
    """Test handling of unexpected errors in project by ID endpoint."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/443"
    ).mock(side_effect=Exception("Unexpected error"))
    
    response = await client.get("/api/field-tm/projectid/443")
    
    assert response.status_code == 500
    assert "Typing error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_server_error(client: AsyncClient):
    """Test handling of 500 server errors from FMTM API."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/443"
    ).mock(return_value=Response(500, text="Internal Server Error"))
    
    response = await client.get("/api/field-tm/projectid/443")
    
    assert response.status_code == 500
    assert "Error querying FMTM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_forbidden(client: AsyncClient):
    """Test handling of 403 Forbidden error."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/443"
    ).mock(return_value=Response(403, text="Forbidden"))
    
    response = await client.get("/api/field-tm/projectid/443")
    
    assert response.status_code == 403
    assert "Error querying FMTM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_timeout_error(client: AsyncClient):
    """Test handling of timeout errors."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/summaries"
    ).mock(side_effect=httpx.TimeoutException("Request timeout"))
    
    response = await client.get("/api/field-tm/projects")
    
    assert response.status_code == 503
    assert "FMTM API connection error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_timeout_error(client: AsyncClient):
    """Test handling of timeout errors in project by ID endpoint."""
    respx.get(
        "https://api.fmtm.hotosm.org/projects/443"
    ).mock(side_effect=httpx.TimeoutException("Request timeout"))
    
    response = await client.get("/api/field-tm/projectid/443")
    
    assert response.status_code == 503
    assert "FMTM API connection error" in response.json()["detail"]
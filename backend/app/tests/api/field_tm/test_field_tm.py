"""Tests for FMTM API endpoints."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response


# -------------------------------
# /field-tm/projects
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_success(client: AsyncClient):
    """Test that get_fmtm_projects returns 200 and a valid dict response."""
    mock_response = [
        {"id": 1, "name": "Water Mapping"},
        {"id": 2, "name": "Roads Project"}
    ]

    respx.get("https://api.fmtm.hotosm.org/projects/summaries").mock(
        return_value=Response(200, json=mock_response)
    )

    response = await client.get("/api/field-tm/projects")

    assert response.status_code == 200
    data = response.json()

    # ✅ validar que sea dict y tenga la clave 'projects'
    assert isinstance(data, dict)
    assert "projects" in data
    assert isinstance(data["projects"], list)
    assert all(isinstance(item, dict) for item in data["projects"])
    assert "id" in data["projects"][0]
    assert "name" in data["projects"][0]

@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_http_error(client: AsyncClient):
    """Test handling of HTTP errors from FMTM API."""
    respx.get("https://api.fmtm.hotosm.org/projects/summaries").mock(
        return_value=Response(500, text="Internal Server Error")
    )

    response = await client.get("/api/field-tm/projects")

    assert response.status_code == 500
    assert "Error querying FMTM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_connection_error(client: AsyncClient):
    """Test handling of connection errors from FMTM API."""
    respx.get("https://api.fmtm.hotosm.org/projects/summaries").mock(
        side_effect=httpx.RequestError("Connection failed")
    )

    response = await client.get("/api/field-tm/projects")

    assert response.status_code == 503
    assert "FMTM API connection error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_unexpected_error(client: AsyncClient):
    """Test handling of unexpected errors in FMTM projects endpoint."""
    respx.get("https://api.fmtm.hotosm.org/projects/summaries").mock(
        side_effect=Exception("Something broke")
    )

    response = await client.get("/api/field-tm/projects")

    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]


# -------------------------------
# /field-tm/projectid/{project_id}
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_success(client: AsyncClient):
    """Test that get_fmtm_project_by_id returns 200 and valid project data."""
    mock_response = {"id": 123, "name": "Flood Mapping", "description": "A flood mapping project"}

    respx.get("https://api.fmtm.hotosm.org/projects/123").mock(
        return_value=Response(200, json=mock_response)
    )

    response = await client.get("/api/field-tm/projectid/123")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data["id"] == 123
    assert "name" in data
    assert "description" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_not_found(client: AsyncClient):
    """Test handling of 404 Not Found error from FMTM API."""
    respx.get("https://api.fmtm.hotosm.org/projects/999").mock(
        return_value=Response(404, text="Not Found")
    )

    response = await client.get("/api/field-tm/projectid/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_http_error(client: AsyncClient):
    """Test handling of generic HTTP errors in FMTM project by ID endpoint."""
    respx.get("https://api.fmtm.hotosm.org/projects/321").mock(
        return_value=Response(502, text="Bad Gateway")
    )

    response = await client.get("/api/field-tm/projectid/321")

    assert response.status_code == 502
    assert "Error querying FMTM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_connection_error(client: AsyncClient):
    """Test handling of connection errors in project by ID endpoint."""
    respx.get("https://api.fmtm.hotosm.org/projects/111").mock(
        side_effect=httpx.RequestError("Timeout")
    )

    response = await client.get("/api/field-tm/projectid/111")

    assert response.status_code == 503
    assert "FMTM API connection error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_project_by_id_unexpected_error(client: AsyncClient):
    """Test handling of unexpected exceptions in project by ID endpoint."""
    respx.get("https://api.fmtm.hotosm.org/projects/222").mock(
        side_effect=Exception("Unexpected crash")
    )

    response = await client.get("/api/field-tm/projectid/222")

    assert response.status_code == 500
    assert "Typing error" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_invalid_id(client: AsyncClient):
    """Test FastAPI validation for project_id (must be > 0)."""
    response = await client.get("/api/field-tm/projectid/0")
    assert response.status_code == 422

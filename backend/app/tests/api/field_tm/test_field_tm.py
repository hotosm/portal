# portal/backend/app/tests/api/field_tm/test_field_tm.py

"""Tests for FMTM API endpoints."""

import pytest
import respx
import httpx
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, Response


# -------------------------------
# /field-tm/projects
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_fmtm_projects_success(client: AsyncClient):
    """Test that get_fmtm_projects returns 200 and a valid dict response."""
    # The mock should return an object with "results" and "pagination"
    mock_response = {
        "results": [
            {"id": 1, "name": "Water Mapping"},
            {"id": 2, "name": "Roads Project"}
        ],
        "pagination": {
            "has_next": False,
            "has_prev": False,
            "page": 1,
            "per_page": 20,
            "total": 2
        }
    }

    respx.get("https://api.fmtm.hotosm.org/projects/summaries").mock(
        return_value=Response(200, json=mock_response)
    )

    response = await client.get("/api/field-tm/projects")

    assert response.status_code == 200
    data = response.json()

    # Validate that it is a dict and contains the 'projects' key
    assert isinstance(data, dict)
    assert "projects" in data
    assert isinstance(data["projects"], dict)
    assert "results" in data["projects"]
    assert "pagination" in data["projects"]
    assert isinstance(data["projects"]["results"], list)
    assert len(data["projects"]["results"]) == 2
    assert data["projects"]["results"][0]["id"] == 1
    assert data["projects"]["results"][0]["name"] == "Water Mapping"


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
async def test_get_fmtm_project_by_id_success(client: AsyncClient):
    """Test that get_fmtm_project_by_id returns 200 and valid project data."""
    with patch("app.api.routes.field_tm.field_tm.field_tm_service.fetch_project_by_id", new=AsyncMock(
        return_value={"id": 123, "name": "Flood Mapping", "base_url": "https://field.hotosm.org"}
    )):
        response = await client.get("/api/field-tm/projectid/123")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data["id"] == 123
    assert data["name"] == "Flood Mapping"


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_not_found(client: AsyncClient):
    """Test handling of 404 Not Found — service returns None when project doesn't exist."""
    with patch("app.api.routes.field_tm.field_tm.field_tm_service.fetch_project_by_id", new=AsyncMock(return_value=None)):
        response = await client.get("/api/field-tm/projectid/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_http_error(client: AsyncClient):
    """HTTP errors from field-tm are swallowed by the service; endpoint returns 404."""
    with patch("app.api.routes.field_tm.field_tm.field_tm_service.fetch_project_by_id", new=AsyncMock(return_value=None)):
        response = await client.get("/api/field-tm/projectid/321")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_connection_error(client: AsyncClient):
    """Connection errors from field-tm are swallowed by the service; endpoint returns 404."""
    with patch("app.api.routes.field_tm.field_tm.field_tm_service.fetch_project_by_id", new=AsyncMock(return_value=None)):
        response = await client.get("/api/field-tm/projectid/111")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_unexpected_error(client: AsyncClient):
    """Unexpected errors from field-tm are swallowed by the service; endpoint returns 404."""
    with patch("app.api.routes.field_tm.field_tm.field_tm_service.fetch_project_by_id", new=AsyncMock(side_effect=Exception("Unexpected crash"))):
        response = await client.get("/api/field-tm/projectid/222")

    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_fmtm_project_by_id_invalid_id(client: AsyncClient):
    """Test FastAPI validation for project_id (must be > 0)."""
    response = await client.get("/api/field-tm/projectid/0")
    assert response.status_code == 422
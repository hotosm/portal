"""Tests for Tasking Manager API endpoints."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response


# -------------------------------
# /tasking-manager/projects
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_projects_success(client: AsyncClient):
    """
    Test that get_tasking_manager_projects returns 200 with correct structure.
    """
    mock_response = {
        "mapResults": {"features": []},
        "results": [
            {
                "organisationName": "HOT",
                "organisationSlug": "hot",
                "projectInfo": {"name": "Test Project", "description": "Test"},
                "created": "2024-01-01T00:00:00Z",
                "percentMapped": 50.0,
                "percentValidated": 30.0,
                "percentBadImagery": 5.0
            }
        ],
        "pagination": {
            "hasNext": False,
            "hasPrev": False,
            "page": 1,
            "perPage": 20,
            "total": 1
        }
    }

    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/tasking-manager/projects")

    assert response.status_code == 200
    data = response.json()
    assert "mapResults" in data
    assert "results" in data
    assert "pagination" in data
    assert len(data["results"]) == 1
    assert data["results"][0]["organisationName"] == "HOT"


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_projects_response_structure(client: AsyncClient):
    """Test that tasking manager projects response has all required fields."""
    mock_response = {
        "mapResults": {},
        "results": [],
        "pagination": {
            "hasNext": False,
            "hasPrev": False,
            "page": 1,
            "perPage": 20,
            "total": 0
        }
    }

    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/tasking-manager/projects")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "mapResults" in data
    assert "results" in data
    assert "pagination" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_projects_http_error(client: AsyncClient):
    """Test handling of HTTP errors from Tasking Manager API."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/"
    ).mock(return_value=Response(500, text="Internal Server Error"))

    response = await client.get("/api/tasking-manager/projects")

    assert response.status_code == 500
    assert "Error al consultar API de HOT OSM" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_projects_connection_error(client: AsyncClient):
    """Test handling of connection errors from Tasking Manager API."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/"
    ).mock(side_effect=httpx.RequestError("Connection failed"))

    response = await client.get("/api/tasking-manager/projects")

    assert response.status_code == 503
    assert "Error de conexión con API de HOT OSM" in response.json()["detail"]


# -------------------------------
# /tasking-manager/countries
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_hotosm_countries_success(client: AsyncClient):
    """
    Test that get_hotosm_countries returns 200 with countries list.
    """
    mock_response = {
        "tags": ["Argentina", "Brazil", "Chile", "Colombia"]
    }

    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/countries/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/tasking-manager/countries")

    assert response.status_code == 200
    data = response.json()
    assert "tags" in data
    assert isinstance(data["tags"], list)
    assert len(data["tags"]) == 4
    assert "Argentina" in data["tags"]


@pytest.mark.asyncio
@respx.mock
async def test_get_hotosm_countries_response_structure(client: AsyncClient):
    """Test that countries endpoint returns proper structure."""
    mock_response = {"tags": ["Argentina"]}

    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/countries/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/tasking-manager/countries")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "tags" in data
    assert isinstance(data["tags"], list)


@pytest.mark.asyncio
@respx.mock
async def test_get_hotosm_countries_http_error(client: AsyncClient):
    """Test handling of HTTP errors in countries endpoint."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/countries/"
    ).mock(return_value=Response(502, text="Bad Gateway"))

    response = await client.get("/api/tasking-manager/countries")

    assert response.status_code == 502
    assert "Error querying HOT OSM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_hotosm_countries_connection_error(client: AsyncClient):
    """Test handling of connection errors in countries endpoint."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/countries/"
    ).mock(side_effect=httpx.RequestError("Timeout"))

    response = await client.get("/api/tasking-manager/countries")

    assert response.status_code == 503
    assert "Connection error with HOT OSM API" in response.json()["detail"]


# -------------------------------
# /tasking-manager/projectid/{project_id}
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_project_by_id_success(client: AsyncClient):
    """Test that get_tasking_manager_project_by_id returns 200 and project data."""
    mock_response = {
        "projectId": 123,
        "organisationName": "HOT",
        "organisationSlug": "hot",
        "projectInfo": {"name": "Test", "description": "Test project"},
        "projectInfoLocales": [],
        "created": "2024-01-01T00:00:00Z",
        "percentMapped": 75.5,
        "percentValidated": 50.0,
        "percentBadImagery": 2.5,
        "extraField": "should be filtered out"
    }

    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/123/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/tasking-manager/projectid/123")

    assert response.status_code == 200
    data = response.json()
    assert data["organisationName"] == "HOT"
    assert data["organisationSlug"] == "hot"
    assert "projectInfo" in data
    assert data["percentMapped"] == 75.5


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_project_by_id_filtered_fields(client: AsyncClient):
    """Test that only specified fields are returned."""
    mock_response = {
        "projectId": 456,
        "organisationName": "Test Org",
        "organisationSlug": "test-org",
        "projectInfo": {"name": "Project", "description": "Desc"},
        "created": "2024-02-01T00:00:00Z",
        "percentMapped": 100.0,
        "percentValidated": 100.0,
        "percentBadImagery": 0.0,
        "unwantedField": "this should not appear"
    }

    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/456/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/tasking-manager/projectid/456")

    assert response.status_code == 200
    data = response.json()
    assert "unwantedField" not in data
    assert "organisationName" in data
    assert "projectInfo" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_project_by_id_not_found(client: AsyncClient):
    """Test handling of 404 Not Found error."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/999/"
    ).mock(return_value=Response(404, text="Not Found"))

    response = await client.get("/api/tasking-manager/projectid/999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_tasking_manager_project_by_id_invalid_id(client: AsyncClient):
    """Test FastAPI validation for project_id (must be > 0)."""
    response = await client.get("/api/tasking-manager/projectid/0")
    assert response.status_code == 422


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_project_by_id_connection_error(client: AsyncClient):
    """Test handling of connection errors."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/111/"
    ).mock(side_effect=httpx.RequestError("Network error"))

    response = await client.get("/api/tasking-manager/projectid/111")

    assert response.status_code == 503
    assert "Connection error with HOT OSM API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_tasking_manager_project_by_id_unexpected_error(client: AsyncClient):
    """Test handling of unexpected exceptions."""
    respx.get(
        "https://tasking-manager-production-api.hotosm.org/api/v2/projects/222/"
    ).mock(side_effect=Exception("Unexpected crash"))

    response = await client.get("/api/tasking-manager/projectid/222")

    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]
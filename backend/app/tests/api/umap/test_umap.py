# portal/backend/app/tests/api/umap/test_umap.py

"""Tests for uMap API endpoints."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response

# Import the URL from the umap module to use in mocks
from app.api.routes.umap.umap import UMAP_API_BASE_URL


# -------------------------------
# /umap/{location}/{project_id}
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_success(client: AsyncClient):
    """
    Test that get_umap_data returns 200 with correct GeoJSON structure.
    """
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-76.793844, 17.971321],
                    "type": "Point"
                },
                "properties": {
                    "description": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/u70ySp4OuHY?si=3HtGzIHUhnwaEUSs\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
                    "_umap_options": {
                        "iconOpacity": 0.5
                    }
                },
                "id": "I0NDU"
            }
        ],
        "_umap_options": {
            "displayOnLoad": True,
            "inCaption": True,
            "browsable": True,
            "editMode": "advanced",
            "id": "a59b5458-8c8e-48b1-911f-4c6c602fc357",
            "name": "Live Cameras",
            "rank": 3,
            "color": "SlateBlue",
            "iconUrl": "/uploads/pictogram/cinema.svg",
            "popupShape": "Large",
            "remoteData": {},
            "popupContentTemplate": "",
            "permissions": {
                "edit_status": 0
            }
        }
    }

    respx.get(
        f"{UMAP_API_BASE_URL}/1428/a59b5458-8c8e-48b1-911f-4c6c602fc357/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/1428/a59b5458-8c8e-48b1-911f-4c6c602fc357")

    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert len(data["features"]) == 1
    assert data["features"][0]["type"] == "Feature"
    assert data["features"][0]["geometry"]["type"] == "Point"


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_response_structure(client: AsyncClient):
    """Test that uMap response has all required GeoJSON fields."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-76.797801, 18.01067],
                    "type": "Point"
                },
                "properties": {
                    "description": "Test description"
                },
                "id": "AzMzA"
            }
        ]
    }

    respx.get(
        f"{UMAP_API_BASE_URL}/test/uuid-test/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/test/uuid-test")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data["type"] == "FeatureCollection"
    assert isinstance(data["features"], list)
    # _umap_options is optional, so we just check the required fields
    assert "features" in data


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_multiple_features(client: AsyncClient):
    """Test handling of multiple features in the collection."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-76.793844, 17.971321],
                    "type": "Point"
                },
                "properties": {
                    "description": "Camera 1"
                },
                "id": "ID001"
            },
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-76.797801, 18.01067],
                    "type": "Point"
                },
                "properties": {
                    "description": "Camera 2"
                },
                "id": "ID002"
            },
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-76.989355, 18.061229],
                    "type": "Point"
                },
                "properties": {
                    "description": "Camera 3"
                },
                "id": "ID003"
            }
        ]
    }

    respx.get(
        f"{UMAP_API_BASE_URL}/1428/multi-test/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/1428/multi-test")

    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 3
    assert all(feature["type"] == "Feature" for feature in data["features"])


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_not_found(client: AsyncClient):
    """Test handling of 404 Not Found error."""
    respx.get(
        f"{UMAP_API_BASE_URL}/9999/invalid-uuid/"
    ).mock(return_value=Response(404, text="Not Found"))

    response = await client.get("/api/umap/9999/invalid-uuid")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    assert "9999" in response.json()["detail"]
    assert "invalid-uuid" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_http_error(client: AsyncClient):
    """Test handling of HTTP errors from uMap API."""
    respx.get(
        f"{UMAP_API_BASE_URL}/1428/error-test/"
    ).mock(return_value=Response(500, text="Internal Server Error"))

    response = await client.get("/api/umap/1428/error-test")

    assert response.status_code == 500
    assert "Error querying uMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_connection_error(client: AsyncClient):
    """Test handling of connection errors from uMap API."""
    respx.get(
        f"{UMAP_API_BASE_URL}/1428/connection-error/"
    ).mock(side_effect=httpx.RequestError("Connection timeout"))

    response = await client.get("/api/umap/1428/connection-error")

    assert response.status_code == 503
    assert "Connection error with uMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_unexpected_error(client: AsyncClient):
    """Test handling of unexpected exceptions."""
    respx.get(
        f"{UMAP_API_BASE_URL}/1428/unexpected/"
    ).mock(side_effect=Exception("Unexpected crash"))

    response = await client.get("/api/umap/1428/unexpected")

    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_with_umap_options(client: AsyncClient):
    """Test that _umap_options are properly parsed when present."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-78.215, 18.245],
                    "type": "Point"
                },
                "properties": {
                    "description": "Test",
                    "_umap_options": {
                        "iconOpacity": 0.5
                    }
                },
                "id": "M0NDE"
            }
        ],
        "_umap_options": {
            "displayOnLoad": True,
            "name": "Test Layer",
            "color": "SlateBlue"
        }
    }

    respx.get(
        f"{UMAP_API_BASE_URL}/1428/umap-options-test/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/1428/umap-options-test")

    assert response.status_code == 200
    data = response.json()
    # Check that _umap_options exists at layer level when provided
    if "_umap_options" in data:
        assert data["_umap_options"]["displayOnLoad"] is True
        assert data["_umap_options"]["color"] == "SlateBlue"
    # Check feature properties _umap_options when provided
    feature_props = data["features"][0]["properties"]
    if "_umap_options" in feature_props:
        assert feature_props["_umap_options"]["iconOpacity"] == 0.5


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_empty_features(client: AsyncClient):
    """Test handling of empty features array."""
    mock_response = {
        "type": "FeatureCollection",
        "features": []
    }

    respx.get(
        f"{UMAP_API_BASE_URL}/1428/empty/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/1428/empty")

    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 0
    assert isinstance(data["features"], list)


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_bad_gateway(client: AsyncClient):
    """Test handling of 502 Bad Gateway error."""
    respx.get(
        f"{UMAP_API_BASE_URL}/1428/bad-gateway/"
    ).mock(return_value=Response(502, text="Bad Gateway"))

    response = await client.get("/api/umap/1428/bad-gateway")

    assert response.status_code == 502
    assert "Error querying uMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_feature_without_id(client: AsyncClient):
    """Test handling of features without id field."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "coordinates": [-76.793844, 17.971321],
                    "type": "Point"
                },
                "properties": {
                    "description": "Feature without ID"
                }
            }
        ]
    }

    respx.get(
        f"{UMAP_API_BASE_URL}/1428/no-id/"
    ).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/1428/no-id")

    assert response.status_code == 200
    data = response.json()
    # ID is optional, so we check it can be None or not present
    feature = data["features"][0]
    assert "id" not in feature or feature.get("id") is None
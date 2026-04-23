# portal/backend/app/tests/api/umap/test_umap.py

"""Tests for uMap API endpoints."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response

from app.api.routes.umap.umap import UMAP_API_BASE_URL, UMAP_BASE_URL, UMAP_SHOWCASE_URL

UMAP_MAPS_API_URL = f"{UMAP_BASE_URL}/api/v1/maps/?source=mine"


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

    assert response.status_code == 503
    assert "umap" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_connection_error(client: AsyncClient):
    """Test handling of connection errors from uMap API."""
    respx.get(
        f"{UMAP_API_BASE_URL}/1428/connection-error/"
    ).mock(side_effect=httpx.RequestError("Connection timeout"))

    response = await client.get("/api/umap/1428/connection-error")

    assert response.status_code == 503
    assert "umap" in response.json()["detail"]


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
    if "_umap_options" in data:
        assert data["_umap_options"]["displayOnLoad"] is True
        assert data["_umap_options"]["color"] == "SlateBlue"
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

    assert response.status_code == 503
    assert "umap" in response.json()["detail"]


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
    feature = data["features"][0]
    assert "id" not in feature or feature.get("id") is None


# -------------------------------
# /umap/showcase
# -------------------------------

def _showcase_feature(name: str, slug: str, author: str) -> dict:
    """Helper to build a showcase GeoJSON feature with wiki-style description."""
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [16.7, 1.15]},
        "properties": {
            "name": name,
            "description": (
                f"Some description.\n\n"
                f"by [[/en/user/{author}/|{author}]]\n"
                f"[[/en/map/{slug}|View the map]]"
            ),
        },
    }


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_success(client: AsyncClient):
    """Test that get_showcase returns 200 with parsed map list."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            _showcase_feature("Waste Hotspots", "waste-hotspots_2234", "alice"),
            _showcase_feature("Flood Risk", "flood-risk_1780", "bob"),
        ],
    }

    respx.get(UMAP_SHOWCASE_URL).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert data["total"] == 2
    assert len(data["features"]) == 2


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_parses_author_and_map_url(client: AsyncClient):
    """Test that author and map_url are extracted from the description."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [_showcase_feature("Test Map", "test-map_999", "mapper42")],
    }

    respx.get(UMAP_SHOWCASE_URL).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 200
    props = response.json()["features"][0]["properties"]
    assert props["author"] == "mapper42"
    assert props["map_id"] == "999"
    assert "/en/map/test-map_999" in props["map_url"]


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_empty_features(client: AsyncClient):
    """Test that an empty showcase is handled correctly."""
    mock_response = {"type": "FeatureCollection", "features": []}

    respx.get(UMAP_SHOWCASE_URL).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["features"] == []


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_missing_description_fields(client: AsyncClient):
    """Test features without author/map links in description return None values."""
    mock_response = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [0.0, 0.0]},
                "properties": {"name": "No Links Map", "description": "Just plain text."},
            }
        ],
    }

    respx.get(UMAP_SHOWCASE_URL).mock(return_value=Response(200, json=mock_response))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 200
    props = response.json()["features"][0]["properties"]
    assert props["author"] is None
    assert props["map_url"] is None
    assert props["map_id"] is None


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_http_error(client: AsyncClient):
    """Test that HTTP errors from uMap are propagated correctly."""
    respx.get(UMAP_SHOWCASE_URL).mock(return_value=Response(503, text="Service Unavailable"))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 503
    assert "Error fetching uMap showcase" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_connection_error(client: AsyncClient):
    """Test that connection errors to uMap return 503."""
    respx.get(UMAP_SHOWCASE_URL).mock(side_effect=httpx.RequestError("Timeout"))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 503
    assert "Connection error to uMap showcase" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_showcase_unexpected_error(client: AsyncClient):
    """Test that unexpected exceptions return 500."""
    respx.get(UMAP_SHOWCASE_URL).mock(side_effect=Exception("Boom"))

    response = await client.get("/api/umap/showcase")

    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]


# -------------------------------
# /umap/user/maps
# -------------------------------

UMAP_MAPS_URL = f"{UMAP_BASE_URL}/api/v1/maps/"


@pytest.mark.asyncio
@respx.mock
async def test_get_user_maps_success(client: AsyncClient):
    """Test that get_user_maps returns 200 with the upstream JSON payload."""
    payload = {
        "maps": [
            {"id": 1813, "name": "Makeni Survey", "slug": "makeni-survey"},
            {"id": 1780, "name": "Flood Risk", "slug": "flood-risk"},
        ]
    }
    respx.get(UMAP_MAPS_URL).mock(return_value=Response(200, json=payload))

    response = await client.get("/api/umap/user/maps", cookies={"hanko": "tok123"})

    assert response.status_code == 200
    data = response.json()
    assert "maps" in data
    assert len(data["maps"]) == 2
    assert data["maps"][0]["id"] == 1813
    assert data["maps"][1]["id"] == 1780


@pytest.mark.asyncio
async def test_get_user_maps_no_cookie(client: AsyncClient):
    """Test that missing Hanko cookie returns 401."""
    response = await client.get("/api/umap/user/maps")

    assert response.status_code == 401
    assert "cookie" in response.json()["detail"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_get_user_maps_upstream_unauthorized(client: AsyncClient):
    """Test that an upstream 401 is translated to a 401 auth error."""
    respx.get(UMAP_MAPS_URL).mock(return_value=Response(401, text="Unauthorized"))

    response = await client.get("/api/umap/user/maps", cookies={"hanko": "expired"})

    assert response.status_code == 401
    assert "authentication failed" in response.json()["detail"].lower()


@pytest.mark.asyncio
@respx.mock
async def test_get_user_maps_empty_list(client: AsyncClient):
    """Test that an empty maps list is returned as-is."""
    respx.get(UMAP_MAPS_URL).mock(return_value=Response(200, json={"maps": []}))

    response = await client.get("/api/umap/user/maps", cookies={"hanko": "tok"})

    assert response.status_code == 200
    assert response.json()["maps"] == []


@pytest.mark.asyncio
@respx.mock
async def test_get_user_maps_http_error(client: AsyncClient):
    """Test that an upstream HTTP error is propagated."""
    respx.get(UMAP_MAPS_URL).mock(return_value=Response(503, text="Service Unavailable"))

    response = await client.get("/api/umap/user/maps", cookies={"hanko": "tok"})

    assert response.status_code == 503
    assert "uMap error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_user_maps_connection_error(client: AsyncClient):
    """Test that a connection error returns 503."""
    respx.get(UMAP_MAPS_URL).mock(side_effect=httpx.RequestError("Timeout"))

    response = await client.get("/api/umap/user/maps", cookies={"hanko": "tok"})

    assert response.status_code == 503
    assert "Connection error to uMap" in response.json()["detail"]


# -------------------------------
# parse_map_links (unit)
# -------------------------------

def testparse_map_links_extracts_id_and_slug():
    """Unit test for the HTML parser helper."""
    from app.api.routes.umap.umap import parse_map_links

    html = _maps_html(
        ("/es/map/sierra-leone_2001", "SL"),
        ("/map/no-locale_99", "No locale"),
    )
    result = parse_map_links(html)

    assert len(result) == 2
    assert result[0]["id"] == "2001"
    assert result[0]["slug"] == "sierra-leone_2001"
    assert result[1]["id"] == "99"


def testparse_map_links_ignores_non_map_hrefs():
    """Non-map hrefs must not appear in the result."""
    from app.api.routes.umap.umap import parse_map_links

    html = """<html><body>
        <a href="/es/map/valid_10">Valid</a>
        <a href="/es/about">About</a>
        <a href="https://external.example.com/map/foo_1">External</a>
        <a href="/es/map/share_only?share">Share</a>
    </body></html>"""
    result = parse_map_links(html)

    assert len(result) == 1
    assert result[0]["id"] == "10"

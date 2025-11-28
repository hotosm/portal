"""Tests for uMap API endpoints including user templates."""

import pytest
import respx
import httpx
from httpx import AsyncClient, Response


# -------------------------------
# /umap/user/{username}/templates
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_success(client: AsyncClient):
    """Test successful retrieval of user templates."""
    mock_html = """
    <!DOCTYPE html>
    <html>
    <body>
        <div class="card">
            <umap-fragment data-settings='{"type": "Feature", "geometry": {"type": "Point", "coordinates": [-59.875, -33.723]}, "properties": {"name": "Test Map", "zoom": 7, "center": {"lat": -33.723, "lng": -59.875}, "id": 1814, "datalayers": [{"id": "7fdafd76-ef54-4c9a-957b-052584f82d82", "name": "Layer 1", "rank": 0}]}}'>
                <div id="map_1814" class="map_fragment"></div>
            </umap-fragment>
            <hgroup>
                <div>
                    <h3><mark class="template-map">[plantilla]</mark> Test Map</h3>
                    <p>por <a href="/es/user/TestUser/">TestUser</a></p>
                </div>
                <a class="main" href="/es/map/test-map_1814">Ver la plantilla</a>
            </hgroup>
        </div>
    </body>
    </html>
    """
    
    respx.get("https://umap.hotosm.org/es/user/TestUser/").mock(
        return_value=Response(200, text=mock_html)
    )
    
    response = await client.get("/api/umap/user/TestUser/templates")
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "TestUser"
    assert data["total_templates"] == 1
    assert len(data["templates"]) == 1
    
    template = data["templates"][0]
    assert template["map_id"] == 1814
    assert template["name"] == "Test Map"
    assert template["author"] == "TestUser"
    assert template["is_template"] is True
    assert "https://umap.hotosm.org" in template["view_url"]
    assert len(template["datalayers"]) == 1
    assert template["datalayers"][0]["id"] == "7fdafd76-ef54-4c9a-957b-052584f82d82"
    assert template["datalayers"][0]["name"] == "Layer 1"


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_multiple(client: AsyncClient):
    """Test retrieval of multiple templates."""
    mock_html = """
    <!DOCTYPE html>
    <html>
    <body>
        <div class="card">
            <umap-fragment data-settings='{"type": "Feature", "properties": {"id": 100, "name": "Map 1", "datalayers": [{"id": "uuid-1", "name": "Layer 1", "rank": 0}]}}'>
                <div id="map_100"></div>
            </umap-fragment>
            <h3><mark class="template-map">[template]</mark> Map 1</h3>
        </div>
        <div class="card">
            <umap-fragment data-settings='{"type": "Feature", "properties": {"id": 200, "name": "Map 2", "datalayers": [{"id": "uuid-2", "name": "Layer 2", "rank": 0}]}}'>
                <div id="map_200"></div>
            </umap-fragment>
            <h3><mark class="template-map">[template]</mark> Map 2</h3>
        </div>
    </body>
    </html>
    """
    
    respx.get("https://umap.hotosm.org/es/user/TestUser/").mock(
        return_value=Response(200, text=mock_html)
    )
    
    response = await client.get("/api/umap/user/TestUser/templates")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_templates"] == 2
    assert len(data["templates"]) == 2
    assert data["templates"][0]["map_id"] == 100
    assert data["templates"][1]["map_id"] == 200


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_with_center_and_zoom(client: AsyncClient):
    """Test that center and zoom are properly extracted."""
    mock_html = """
    <!DOCTYPE html>
    <html>
    <body>
        <div class="card">
            <umap-fragment data-settings='{"type": "Feature", "properties": {"id": 1814, "name": "Test", "center": {"lat": -33.5, "lng": -60.0}, "zoom": 10, "datalayers": []}}'>
                <div id="map_1814"></div>
            </umap-fragment>
            <h3><mark class="template-map">[template]</mark> Test</h3>
        </div>
    </body>
    </html>
    """
    
    respx.get("https://umap.hotosm.org/es/user/TestUser/").mock(
        return_value=Response(200, text=mock_html)
    )
    
    response = await client.get("/api/umap/user/TestUser/templates")
    
    assert response.status_code == 200
    data = response.json()
    template = data["templates"][0]
    assert template["center"]["lat"] == -33.5
    assert template["center"]["lng"] == -60.0
    assert template["zoom"] == 10


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_no_templates(client: AsyncClient):
    """Test user with no templates."""
    mock_html = """
    <!DOCTYPE html>
    <html>
    <body>
        <div class="card">
            <h3>Regular Map (not a template)</h3>
        </div>
    </body>
    </html>
    """
    
    respx.get("https://umap.hotosm.org/es/user/EmptyUser/").mock(
        return_value=Response(200, text=mock_html)
    )
    
    response = await client.get("/api/umap/user/EmptyUser/templates")
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "EmptyUser"
    assert data["total_templates"] == 0
    assert len(data["templates"]) == 0


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_user_not_found(client: AsyncClient):
    """Test handling of 404 when user doesn't exist."""
    respx.get("https://umap.hotosm.org/es/user/NonExistent/").mock(
        return_value=Response(404, text="Not Found")
    )
    
    response = await client.get("/api/umap/user/NonExistent/templates")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    assert "NonExistent" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_connection_error(client: AsyncClient):
    """Test handling of connection errors."""
    respx.get("https://umap.hotosm.org/es/user/TestUser/").mock(
        side_effect=httpx.RequestError("Connection timeout")
    )
    
    response = await client.get("/api/umap/user/TestUser/templates")
    
    assert response.status_code == 503
    assert "Connection error" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_fallback_to_div_id(client: AsyncClient):
    """Test fallback to extracting map_id from div id when not in properties."""
    mock_html = """
    <!DOCTYPE html>
    <html>
    <body>
        <div class="card">
            <umap-fragment data-settings='{"type": "Feature", "properties": {"name": "Test", "datalayers": []}}'>
                <div id="map_999"></div>
            </umap-fragment>
            <h3><mark class="template-map">[template]</mark> Test</h3>
        </div>
    </body>
    </html>
    """
    
    respx.get("https://umap.hotosm.org/es/user/TestUser/").mock(
        return_value=Response(200, text=mock_html)
    )
    
    response = await client.get("/api/umap/user/TestUser/templates")
    
    assert response.status_code == 200
    data = response.json()
    assert data["templates"][0]["map_id"] == 999


@pytest.mark.asyncio
@respx.mock
async def test_get_user_templates_malformed_json_skipped(client: AsyncClient):
    """Test that cards with malformed JSON are skipped."""
    mock_html = """
    <!DOCTYPE html>
    <html>
    <body>
        <div class="card">
            <umap-fragment data-settings='{"invalid json'>
                <div id="map_1"></div>
            </umap-fragment>
            <h3><mark class="template-map">[template]</mark> Bad</h3>
        </div>
        <div class="card">
            <umap-fragment data-settings='{"type": "Feature", "properties": {"id": 100, "name": "Good", "datalayers": []}}'>
                <div id="map_100"></div>
            </umap-fragment>
            <h3><mark class="template-map">[template]</mark> Good</h3>
        </div>
    </body>
    </html>
    """
    
    respx.get("https://umap.hotosm.org/es/user/TestUser/").mock(
        return_value=Response(200, text=mock_html)
    )
    
    response = await client.get("/api/umap/user/TestUser/templates")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_templates"] == 1
    assert data["templates"][0]["map_id"] == 100


# -------------------------------
# /umap/template/{map_id}/datalayer/{datalayer_id}
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_template_datalayer_success(client: AsyncClient):
    """Test successful retrieval of datalayer data."""
    mock_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-59.875, -33.723]
                },
                "properties": {
                    "description": "Test feature"
                },
                "id": "feature-1"
            }
        ]
    }
    
    respx.get(
        "https://umap.hotosm.org/es/datalayer/1814/7fdafd76-ef54-4c9a-957b-052584f82d82/"
    ).mock(return_value=Response(200, json=mock_geojson))
    
    response = await client.get(
        "/api/umap/template/1814/datalayer/7fdafd76-ef54-4c9a-957b-052584f82d82"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 1
    assert data["features"][0]["geometry"]["type"] == "Point"


@pytest.mark.asyncio
@respx.mock
async def test_get_template_datalayer_not_found(client: AsyncClient):
    """Test handling of 404 when datalayer doesn't exist."""
    respx.get(
        "https://umap.hotosm.org/es/datalayer/9999/invalid-uuid/"
    ).mock(return_value=Response(404, text="Not Found"))
    
    response = await client.get("/api/umap/template/9999/datalayer/invalid-uuid")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    assert "9999" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_template_datalayer_connection_error(client: AsyncClient):
    """Test handling of connection errors."""
    respx.get(
        "https://umap.hotosm.org/es/datalayer/1814/test-uuid/"
    ).mock(side_effect=httpx.RequestError("Connection failed"))
    
    response = await client.get("/api/umap/template/1814/datalayer/test-uuid")
    
    assert response.status_code == 503
    assert "Connection error" in response.json()["detail"]


# -------------------------------
# /umap/{location}/{project_id} (existing tests)
# -------------------------------

@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_success(client: AsyncClient):
    """Test that get_umap_data returns 200 with correct GeoJSON structure."""
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
                    "description": "Test camera",
                    "_umap_options": {
                        "iconOpacity": 0.5
                    }
                },
                "id": "I0NDU"
            }
        ],
        "_umap_options": {
            "displayOnLoad": True,
            "name": "Live Cameras"
        }
    }

    respx.get(
        "https://umap.hotosm.org/en/datalayer/1428/a59b5458-8c8e-48b1-911f-4c6c602fc357/"
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
async def test_get_umap_data_not_found(client: AsyncClient):
    """Test handling of 404 Not Found error."""
    respx.get(
        "https://umap.hotosm.org/en/datalayer/9999/invalid-uuid/"
    ).mock(return_value=Response(404, text="Not Found"))

    response = await client.get("/api/umap/9999/invalid-uuid")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    assert "9999" in response.json()["detail"]
    assert "invalid-uuid" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_connection_error(client: AsyncClient):
    """Test handling of connection errors from uMap API."""
    respx.get(
        "https://umap.hotosm.org/en/datalayer/1428/connection-error/"
    ).mock(side_effect=httpx.RequestError("Connection timeout"))

    response = await client.get("/api/umap/1428/connection-error")

    assert response.status_code == 503
    assert "Connection error with uMap API" in response.json()["detail"]


@pytest.mark.asyncio
@respx.mock
async def test_get_umap_data_unexpected_error(client: AsyncClient):
    """Test handling of unexpected exceptions."""
    respx.get(
        "https://umap.hotosm.org/en/datalayer/1428/unexpected/"
    ).mock(side_effect=Exception("Unexpected crash"))

    response = await client.get("/api/umap/1428/unexpected")

    assert response.status_code == 500
    assert "Unexpected error" in response.json()["detail"]
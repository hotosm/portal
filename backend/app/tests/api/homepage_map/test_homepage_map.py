# portal/backend/app/tests/api/homepage_map/test_homepage_map.py

"""Tests for Homepage Map unified API endpoint."""

import pytest
import httpx
from unittest.mock import AsyncMock, Mock, patch

from app.models.homepage_map import (
    UnifiedMapResponse,
    TaskingManagerMapItem,
    OpenAerialMapItem,
    DroneTMMapItem,
    FAIRMapItem,
    UnifiedGeometry,
    SourceStatus,
)


# Sample mock data for each source
# TM /projects response (only has projectId and priority in mapResults)
MOCK_TM_PROJECTS_RESPONSE = {
    "mapResults": {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [-77.0, 38.9]},
                "properties": {
                    "projectId": 123,
                    "priority": "URGENT",
                },
            }
        ],
    },
    "results": [],
    "pagination": {},
}

# TM /projects/{id} response (has full details)
MOCK_TM_PROJECT_DETAIL = {
    "projectId": 123,
    "projectInfo": {
        "name": "Test TM Project",
        "description": "A test project description",
    },
    "organisationName": "HOT",
    "percentMapped": 50.0,
    "percentValidated": 25.0,
    "created": "2024-01-01T00:00:00Z",
}

MOCK_OAM_RESPONSE = {
    "meta": {"found": 1},
    "results": [
        {
            "_id": "oam123",
            "uuid": "oam-uuid-123",
            "title": "Test Aerial Image",
            "bbox": [-77.1, 38.8, -76.9, 39.0],
            "provider": "Test Provider",
            "gsd": 0.05,
            "acquisition_start": "2024-01-01T00:00:00Z",
            "acquisition_end": "2024-01-01T12:00:00Z",
            "properties": {"thumbnail": "https://example.com/thumb.jpg"},
        }
    ],
}

MOCK_DRONE_TM_RESPONSE = [
    {
        "id": "drone-uuid-123",
        "slug": "test-drone-project",
        "name": "Test Drone Project",
        "centroid": {"type": "Point", "coordinates": [-77.05, 38.95]},
        "total_task_count": 10,
        "ongoing_task_count": 5,
        "completed_task_count": 3,
        "status": "ongoing",
    }
]

MOCK_FAIR_CENTROIDS_RESPONSE = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [85.52, 27.63]},
            "properties": {"mid": 3},
        }
    ],
}

MOCK_FAIR_MODELS_RESPONSE = {
    "count": 1,
    "results": [
        {
            "id": 3,
            "name": "Test AI Model",
            "description": "A test model",
            "accuracy": 88.9,
            "status": 0,
            "base_model": "RAMP",
            "thumbnail_url": "https://example.com/model.jpg",
            "user": {"osm_id": 12345, "username": "testuser"},
            "created_at": "2024-01-01T00:00:00Z",
        }
    ],
}


class TestFetchTaskingManagerProjects:
    """Test suite for fetch_tasking_manager_projects function"""

    @pytest.mark.asyncio
    async def test_fetch_success_with_details(self):
        """Test successful fetch from Tasking Manager with project details"""
        # First call: /projects returns centroids
        mock_projects_response = Mock()
        mock_projects_response.json.return_value = MOCK_TM_PROJECTS_RESPONSE
        mock_projects_response.raise_for_status = Mock()

        # Second call: /projects/{id} returns details
        mock_detail_response = Mock()
        mock_detail_response.json.return_value = MOCK_TM_PROJECT_DETAIL
        mock_detail_response.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=[mock_projects_response, mock_detail_response]
        )

        from app.api.routes.homepage_map.homepage_map import fetch_tasking_manager_projects

        items, status = await fetch_tasking_manager_projects(mock_client)

        assert status.success is True
        assert status.count == 1
        assert status.error is None
        assert len(items) == 1
        assert items[0].id == 123
        assert items[0].source == "tasking-manager"
        assert items[0].name == "Test TM Project"
        assert items[0].description == "A test project description"
        assert items[0].organisation == "HOT"
        assert items[0].geometry.coordinates == [-77.0, 38.9]
        assert items[0].percent_mapped == 50.0

    @pytest.mark.asyncio
    async def test_fetch_success_detail_fails(self):
        """Test when centroids succeed but detail fetch fails - should still include item"""
        mock_projects_response = Mock()
        mock_projects_response.json.return_value = MOCK_TM_PROJECTS_RESPONSE
        mock_projects_response.raise_for_status = Mock()

        # Detail call fails
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=[
                mock_projects_response,
                Exception("Failed to fetch details"),
            ]
        )

        from app.api.routes.homepage_map.homepage_map import fetch_tasking_manager_projects

        items, status = await fetch_tasking_manager_projects(mock_client)

        assert status.success is True
        assert status.count == 1
        assert len(items) == 1
        assert items[0].id == 123
        assert items[0].name is None  # No details available
        assert items[0].geometry.coordinates == [-77.0, 38.9]  # Geometry still present

    @pytest.mark.asyncio
    async def test_fetch_http_error_on_projects(self):
        """Test HTTP error handling on /projects call"""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=httpx.HTTPStatusError(
                "Server Error", request=Mock(), response=mock_response
            )
        )

        from app.api.routes.homepage_map.homepage_map import fetch_tasking_manager_projects

        items, status = await fetch_tasking_manager_projects(mock_client)

        assert status.success is False
        assert status.count == 0
        assert "HTTP 500" in status.error
        assert len(items) == 0

    @pytest.mark.asyncio
    async def test_fetch_empty_map_results(self):
        """Test with empty mapResults"""
        mock_response = Mock()
        mock_response.json.return_value = {"mapResults": None, "results": []}
        mock_response.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)

        from app.api.routes.homepage_map.homepage_map import fetch_tasking_manager_projects

        items, status = await fetch_tasking_manager_projects(mock_client)

        assert status.success is True
        assert status.count == 0
        assert len(items) == 0

    @pytest.mark.asyncio
    async def test_fetch_multiple_projects(self):
        """Test fetching multiple projects with details"""
        mock_projects_response = Mock()
        mock_projects_response.json.return_value = {
            "mapResults": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [-77.0, 38.9]},
                        "properties": {"projectId": 123, "priority": "URGENT"},
                    },
                    {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [-78.0, 39.0]},
                        "properties": {"projectId": 456, "priority": "HIGH"},
                    },
                ],
            },
            "results": [],
        }
        mock_projects_response.raise_for_status = Mock()

        mock_detail_1 = Mock()
        mock_detail_1.json.return_value = {
            "projectId": 123,
            "projectInfo": {"name": "Project 1", "description": "Desc 1"},
            "organisationName": "Org1",
        }
        mock_detail_1.raise_for_status = Mock()

        mock_detail_2 = Mock()
        mock_detail_2.json.return_value = {
            "projectId": 456,
            "projectInfo": {"name": "Project 2", "description": "Desc 2"},
            "organisationName": "Org2",
        }
        mock_detail_2.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=[mock_projects_response, mock_detail_1, mock_detail_2]
        )

        from app.api.routes.homepage_map.homepage_map import fetch_tasking_manager_projects

        items, status = await fetch_tasking_manager_projects(mock_client)

        assert status.success is True
        assert status.count == 2
        assert len(items) == 2
        assert items[0].id == 123
        assert items[0].name == "Project 1"
        assert items[1].id == 456
        assert items[1].name == "Project 2"


class TestFetchOpenAerialMapProjects:
    """Test suite for fetch_open_aerial_map_projects function"""

    @pytest.mark.asyncio
    async def test_fetch_success(self):
        """Test successful fetch from Open Aerial Map"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_OAM_RESPONSE
        mock_response.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)

        from app.api.routes.homepage_map.homepage_map import fetch_open_aerial_map_projects

        items, status = await fetch_open_aerial_map_projects(mock_client)

        assert status.success is True
        assert status.count == 1
        assert len(items) == 1
        assert items[0].id == "oam123"
        assert items[0].source == "open-aerial-map"
        assert items[0].name == "Test Aerial Image"
        # Centroid should be calculated from bbox
        assert items[0].geometry.coordinates[0] == pytest.approx(-77.0, abs=0.01)
        assert items[0].geometry.coordinates[1] == pytest.approx(38.9, abs=0.01)
        assert items[0].thumbnail == "https://example.com/thumb.jpg"

    @pytest.mark.asyncio
    async def test_fetch_no_bbox(self):
        """Test with image missing bbox"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "results": [{"_id": "no-bbox", "title": "No Bbox Image"}]
        }
        mock_response.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)

        from app.api.routes.homepage_map.homepage_map import fetch_open_aerial_map_projects

        items, status = await fetch_open_aerial_map_projects(mock_client)

        assert status.success is True
        assert len(items) == 1
        assert items[0].geometry is None

    @pytest.mark.asyncio
    async def test_fetch_http_error(self):
        """Test HTTP error handling"""
        mock_response = Mock()
        mock_response.status_code = 503
        mock_response.text = "Service Unavailable"

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=httpx.HTTPStatusError(
                "Service Unavailable", request=Mock(), response=mock_response
            )
        )

        from app.api.routes.homepage_map.homepage_map import fetch_open_aerial_map_projects

        items, status = await fetch_open_aerial_map_projects(mock_client)

        assert status.success is False
        assert "HTTP 503" in status.error


class TestFetchDroneTMProjects:
    """Test suite for fetch_drone_tm_projects function"""

    @pytest.mark.asyncio
    async def test_fetch_success_array_response(self):
        """Test successful fetch with array response"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_DRONE_TM_RESPONSE
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client_instance = AsyncMock()
            mock_client_instance.get = AsyncMock(return_value=mock_response)
            mock_client_class.return_value.__aenter__.return_value = mock_client_instance

            from app.api.routes.homepage_map.homepage_map import fetch_drone_tm_projects

            items, status = await fetch_drone_tm_projects(None)

            assert status.success is True
            assert status.count == 1
            assert len(items) == 1
            assert items[0].id == "drone-uuid-123"
            assert items[0].source == "drone-tasking-manager"
            assert items[0].name == "Test Drone Project"
            assert items[0].geometry.coordinates == [-77.05, 38.95]
            assert items[0].total_task_count == 10

    @pytest.mark.asyncio
    async def test_fetch_success_object_response(self):
        """Test successful fetch with object response (wrapped in results)"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "results": MOCK_DRONE_TM_RESPONSE,
            "pagination": {},
        }
        mock_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client_instance = AsyncMock()
            mock_client_instance.get = AsyncMock(return_value=mock_response)
            mock_client_class.return_value.__aenter__.return_value = mock_client_instance

            from app.api.routes.homepage_map.homepage_map import fetch_drone_tm_projects

            items, status = await fetch_drone_tm_projects(None)

            assert status.success is True
            assert status.count == 1

    @pytest.mark.asyncio
    async def test_fetch_http_error(self):
        """Test HTTP error handling"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "Not Found"

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client_instance = AsyncMock()
            mock_client_instance.get = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Not Found", request=Mock(), response=mock_response
                )
            )
            mock_client_class.return_value.__aenter__.return_value = mock_client_instance

            from app.api.routes.homepage_map.homepage_map import fetch_drone_tm_projects

            items, status = await fetch_drone_tm_projects(None)

            assert status.success is False
            assert "HTTP 404" in status.error


class TestFetchFairModels:
    """Test suite for fetch_fair_models function"""

    @pytest.mark.asyncio
    async def test_fetch_success(self):
        """Test successful fetch from fAIr with model enrichment"""
        mock_centroids_response = Mock()
        mock_centroids_response.json.return_value = MOCK_FAIR_CENTROIDS_RESPONSE
        mock_centroids_response.raise_for_status = Mock()

        mock_models_response = Mock()
        mock_models_response.json.return_value = MOCK_FAIR_MODELS_RESPONSE
        mock_models_response.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=[mock_centroids_response, mock_models_response]
        )

        from app.api.routes.homepage_map.homepage_map import fetch_fair_models

        items, status = await fetch_fair_models(mock_client)

        assert status.success is True
        assert status.count == 1
        assert len(items) == 1
        assert items[0].id == 3
        assert items[0].source == "fair"
        assert items[0].name == "Test AI Model"
        assert items[0].geometry.coordinates == [85.52, 27.63]
        assert items[0].accuracy == 88.9
        assert items[0].username == "testuser"

    @pytest.mark.asyncio
    async def test_fetch_model_not_in_lookup(self):
        """Test centroid with model not found in lookup"""
        mock_centroids_response = Mock()
        mock_centroids_response.json.return_value = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [0, 0]},
                    "properties": {"mid": 999},  # Not in models list
                }
            ],
        }
        mock_centroids_response.raise_for_status = Mock()

        mock_models_response = Mock()
        mock_models_response.json.return_value = {"results": []}
        mock_models_response.raise_for_status = Mock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=[mock_centroids_response, mock_models_response]
        )

        from app.api.routes.homepage_map.homepage_map import fetch_fair_models

        items, status = await fetch_fair_models(mock_client)

        assert status.success is True
        assert len(items) == 1
        assert items[0].id == 999
        assert items[0].name is None  # No model details available

    @pytest.mark.asyncio
    async def test_fetch_http_error(self):
        """Test HTTP error handling"""
        mock_response = Mock()
        mock_response.status_code = 502
        mock_response.text = "Bad Gateway"

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(
            side_effect=httpx.HTTPStatusError(
                "Bad Gateway", request=Mock(), response=mock_response
            )
        )

        from app.api.routes.homepage_map.homepage_map import fetch_fair_models

        items, status = await fetch_fair_models(mock_client)

        assert status.success is False
        assert "HTTP 502" in status.error


class TestGetUnifiedMapData:
    """Test suite for get_unified_map_data endpoint"""

    @pytest.mark.asyncio
    async def test_all_sources_success(self):
        """Test with all sources returning successfully"""
        # Mock responses for TM (2 calls: projects list + detail)
        tm_projects_response = Mock()
        tm_projects_response.json.return_value = MOCK_TM_PROJECTS_RESPONSE
        tm_projects_response.raise_for_status = Mock()

        tm_detail_response = Mock()
        tm_detail_response.json.return_value = MOCK_TM_PROJECT_DETAIL
        tm_detail_response.raise_for_status = Mock()

        oam_response = Mock()
        oam_response.json.return_value = MOCK_OAM_RESPONSE
        oam_response.raise_for_status = Mock()

        fair_centroids_response = Mock()
        fair_centroids_response.json.return_value = MOCK_FAIR_CENTROIDS_RESPONSE
        fair_centroids_response.raise_for_status = Mock()

        fair_models_response = Mock()
        fair_models_response.json.return_value = MOCK_FAIR_MODELS_RESPONSE
        fair_models_response.raise_for_status = Mock()

        drone_response = Mock()
        drone_response.json.return_value = MOCK_DRONE_TM_RESPONSE
        drone_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client_class:
            # Main client for TM, OAM, fAIr
            main_mock_client = AsyncMock()
            main_mock_client.get = AsyncMock(
                side_effect=[
                    tm_projects_response,
                    tm_detail_response,  # TM detail fetch
                    oam_response,
                    fair_centroids_response,
                    fair_models_response,
                ]
            )

            # Drone TM uses its own client
            drone_mock_client = AsyncMock()
            drone_mock_client.get = AsyncMock(return_value=drone_response)

            # Configure the mock to return different clients
            call_count = [0]
            def client_factory(*args, **kwargs):
                mock = AsyncMock()
                if call_count[0] == 0:
                    mock.__aenter__.return_value = main_mock_client
                else:
                    mock.__aenter__.return_value = drone_mock_client
                call_count[0] += 1
                return mock

            mock_client_class.side_effect = client_factory

            from app.api.routes.homepage_map.homepage_map import get_unified_map_data

            result = await get_unified_map_data()

            assert result["total_count"] >= 1
            assert "tasking_manager" in result
            assert "open_aerial_map" in result
            assert "drone_tasking_manager" in result
            assert "fair" in result
            assert "sources_status" in result

    @pytest.mark.asyncio
    async def test_exclude_sources(self):
        """Test excluding specific sources"""
        # TM needs 2 responses: projects list + detail
        tm_projects_response = Mock()
        tm_projects_response.json.return_value = MOCK_TM_PROJECTS_RESPONSE
        tm_projects_response.raise_for_status = Mock()

        tm_detail_response = Mock()
        tm_detail_response.json.return_value = MOCK_TM_PROJECT_DETAIL
        tm_detail_response.raise_for_status = Mock()

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(
                side_effect=[tm_projects_response, tm_detail_response]
            )
            mock_client_class.return_value.__aenter__.return_value = mock_client

            from app.api.routes.homepage_map.homepage_map import get_unified_map_data

            result = await get_unified_map_data(
                include_tasking_manager=True,
                include_open_aerial_map=False,
                include_drone_tm=False,
                include_fair=False,
            )

            assert len(result["tasking_manager"]) >= 0
            assert len(result["open_aerial_map"]) == 0
            assert len(result["drone_tasking_manager"]) == 0
            assert len(result["fair"]) == 0
            assert "open_aerial_map" not in result["sources_status"]
            assert "drone_tasking_manager" not in result["sources_status"]
            assert "fair" not in result["sources_status"]

    @pytest.mark.asyncio
    async def test_all_sources_excluded(self):
        """Test when all sources are excluded"""
        from app.api.routes.homepage_map.homepage_map import get_unified_map_data

        result = await get_unified_map_data(
            include_tasking_manager=False,
            include_open_aerial_map=False,
            include_drone_tm=False,
            include_fair=False,
        )

        assert result["total_count"] == 0
        assert len(result["tasking_manager"]) == 0
        assert len(result["open_aerial_map"]) == 0
        assert len(result["drone_tasking_manager"]) == 0
        assert len(result["fair"]) == 0
        assert len(result["sources_status"]) == 0


class TestModels:
    """Test suite for Pydantic models"""

    def test_unified_geometry(self):
        """Test UnifiedGeometry model"""
        geom = UnifiedGeometry(type="Point", coordinates=[-77.0, 38.9])
        assert geom.type == "Point"
        assert geom.coordinates == [-77.0, 38.9]

    def test_tasking_manager_map_item(self):
        """Test TaskingManagerMapItem model"""
        item = TaskingManagerMapItem(
            id=123,
            name="Test Project",
            geometry=UnifiedGeometry(coordinates=[-77.0, 38.9]),
        )
        assert item.source == "tasking-manager"
        assert item.id == 123

    def test_open_aerial_map_item(self):
        """Test OpenAerialMapItem model"""
        item = OpenAerialMapItem(id="oam123", name="Test Image")
        assert item.source == "open-aerial-map"
        assert item.id == "oam123"

    def test_drone_tm_map_item(self):
        """Test DroneTMMapItem model"""
        item = DroneTMMapItem(id="drone123", name="Test Drone Project", status="ongoing")
        assert item.source == "drone-tasking-manager"
        assert item.status == "ongoing"

    def test_fair_map_item(self):
        """Test FAIRMapItem model"""
        item = FAIRMapItem(id=3, name="AI Model", accuracy=88.9)
        assert item.source == "fair"
        assert item.accuracy == 88.9

    def test_source_status(self):
        """Test SourceStatus model"""
        status = SourceStatus(success=True, count=10)
        assert status.success is True
        assert status.count == 10
        assert status.error is None

        error_status = SourceStatus(success=False, count=0, error="Connection failed")
        assert error_status.success is False
        assert error_status.error == "Connection failed"

    def test_unified_map_response(self):
        """Test UnifiedMapResponse model"""
        response = UnifiedMapResponse(
            tasking_manager=[TaskingManagerMapItem(id=1, name="TM")],
            open_aerial_map=[],
            drone_tasking_manager=[],
            fair=[],
            sources_status={"tasking_manager": SourceStatus(success=True, count=1)},
            total_count=1,
        )
        assert len(response.tasking_manager) == 1
        assert response.total_count == 1

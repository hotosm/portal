# portal/backend/app/tests/api/export_tool/test_export_tool.py

"""Tests for Export Tool API endpoints."""

import pytest
import respx
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
import httpx
from datetime import datetime

from app.api.routes.export_tool.export_tool import router, EXPORT_TOOL_API_BASE_URL
from app.models.export_tool import ExportJobsResponse, ExportJob, ExportJobUser

app = FastAPI()
app.include_router(router)

client = TestClient(app)

# Use the configured URL for mocking (matches whatever .env sets)
BASE_URL = EXPORT_TOOL_API_BASE_URL

MOCK_EXPORT_JOBS_RESPONSE = {
    "count": 2,
    "next": None,
    "previous": None,
    "results": [
        {
            "id": 1,
            "uid": "test-job-123",
            "user": {
                "username": "testuser"
            },
            "name": "Test Export Job 1",
            "description": "Test description",
            "event": "test-event",
            "export_formats": ["geopackage", "kml"],
            "published": True,
            "feature_selection": "Buildings:\n  types:\n    - polygons",
            "buffer_aoi": False,
            "osma_link": "http://osm-analytics.org/#/show/bbox:0,0,1,1/buildings/recency",
            "created_at": "2024-01-01T00:00:00Z",
            "area": 1000.5,
            "simplified_geom": {
                "type": "Polygon",
                "coordinates": [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
            },
            "mbtiles_source": "",
            "mbtiles_minzoom": None,
            "mbtiles_maxzoom": None,
            "pinned": True,
            "unfiltered": False,
            "userinfo": False
        },
        {
            "id": 2,
            "uid": "test-job-456",
            "user": {
                "username": "testuser2"
            },
            "name": "Test Export Job 2",
            "description": "Another test",
            "event": None,
            "export_formats": ["shp"],
            "published": False,
            "feature_selection": None,
            "buffer_aoi": False,
            "osma_link": None,
            "created_at": "2024-01-03T00:00:00Z",
            "area": 500.0,
            "simplified_geom": None,
            "mbtiles_source": None,
            "mbtiles_minzoom": None,
            "mbtiles_maxzoom": None,
            "pinned": True,
            "unfiltered": False,
            "userinfo": False
        }
    ]
}

MOCK_JOB_DETAIL_RESPONSE = {
    "id": 1,
    "uid": "test-job-123",
    "user": {
        "username": "testuser"
    },
    "name": "Test Export Job Detail",
    "description": "Detailed test job",
    "event": None,
    "export_formats": ["geopackage"],
    "published": False,
    "feature_selection": None,
    "buffer_aoi": False,
    "osma_link": None,
    "created_at": "2024-01-01T00:00:00Z",
    "area": 100.0,
    "simplified_geom": None,
    "mbtiles_source": None,
    "mbtiles_minzoom": None,
    "mbtiles_maxzoom": None,
    "pinned": False,
    "unfiltered": False,
    "userinfo": False
}


class TestExportToolEndpoints:
    """Tests for Export Tool API endpoints"""

    @respx.mock
    def test_get_export_jobs_success(self):
        """Test successful retrieval of export jobs"""
        respx.get(f"{BASE_URL}/jobs").mock(
            return_value=httpx.Response(200, json=MOCK_EXPORT_JOBS_RESPONSE)
        )

        response = client.get("/export-tool/jobs?pinned=true&all=true&limit=20&offset=0")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["results"]) == 2
        assert data["results"][0]["uid"] == "test-job-123"
        assert data["results"][0]["name"] == "Test Export Job 1"

    @respx.mock
    def test_get_export_jobs_with_filters(self):
        """Test export jobs retrieval with additional filters"""
        respx.get(f"{BASE_URL}/jobs").mock(
            return_value=httpx.Response(200, json=MOCK_EXPORT_JOBS_RESPONSE)
        )

        response = client.get(
            "/export-tool/jobs?pinned=true&all=true&limit=10&offset=0&search=test&status=COMPLETED"
        )

        assert response.status_code == 200
        data = response.json()
        assert "results" in data

    @respx.mock
    def test_get_export_jobs_http_error(self):
        """Test handling of HTTP errors from Export Tool API"""
        respx.get(f"{BASE_URL}/jobs").mock(
            return_value=httpx.Response(404, text="Not Found")
        )

        response = client.get("/export-tool/jobs")

        assert response.status_code == 404
        assert "Error from HOT Export Tool API" in response.json()["detail"]

    @respx.mock
    def test_get_export_jobs_generic_error(self):
        """Test handling of generic errors"""
        respx.get(f"{BASE_URL}/jobs").mock(
            side_effect=Exception("Connection error")
        )

        response = client.get("/export-tool/jobs")

        assert response.status_code == 500
        assert "Connection error" in response.json()["detail"]

    @respx.mock
    def test_get_export_job_detail_success(self):
        """Test successful retrieval of job detail"""
        respx.get(f"{BASE_URL}/jobs/test-job-123").mock(
            return_value=httpx.Response(200, json=MOCK_JOB_DETAIL_RESPONSE)
        )

        response = client.get("/export-tool/jobs/test-job-123")

        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "test-job-123"
        assert data["name"] == "Test Export Job Detail"

    @respx.mock
    def test_get_export_job_detail_not_found(self):
        """Test job detail retrieval with non-existent job"""
        respx.get(f"{BASE_URL}/jobs/non-existent-job").mock(
            return_value=httpx.Response(404, text="Job not found")
        )

        response = client.get("/export-tool/jobs/non-existent-job")

        assert response.status_code == 404

    def test_get_export_jobs_validation(self):
        """Test query parameter validation"""
        # Test negative limit
        response = client.get("/export-tool/jobs?limit=-1")
        assert response.status_code == 422

        # Test limit exceeding maximum
        response = client.get("/export-tool/jobs?limit=101")
        assert response.status_code == 422

        # Test negative offset
        response = client.get("/export-tool/jobs?offset=-1")
        assert response.status_code == 422

    @respx.mock
    def test_export_jobs_response_structure(self):
        """Test that response structure matches expected model"""
        respx.get(f"{BASE_URL}/jobs").mock(
            return_value=httpx.Response(200, json=MOCK_EXPORT_JOBS_RESPONSE)
        )

        response = client.get("/export-tool/jobs")

        assert response.status_code == 200
        data = response.json()

        # Verify top-level structure
        assert "count" in data
        assert "results" in data

        # Verify job structure
        job = data["results"][0]
        assert "id" in job
        assert "uid" in job
        assert "name" in job
        assert "created_at" in job
        assert "export_formats" in job
        assert "simplified_geom" in job


MOCK_MY_JOBS_RESPONSE = {
    "count": 1,
    "next": None,
    "previous": None,
    "results": [
        {
            "id": 391416,
            "uid": "ac94424d-7d0e-45d6-a7a8-8f81cb07fb2c",
            "user": {"username": "testuser"},
            "name": "test buenos aires",
            "description": "test description",
            "event": "test",
            "export_formats": ["geojson"],
            "published": True,
            "feature_selection": "planet_osm_point:\n  types:\n    - points",
            "buffer_aoi": False,
            "osma_link": None,
            "created_at": "2026-02-12T13:56:37.791148Z",
            "area": 0,
            "simplified_geom": {
                "type": "Polygon",
                "coordinates": [[[-58.38, -34.61], [-58.39, -34.61], [-58.39, -34.61], [-58.38, -34.61]]]
            },
            "mbtiles_source": None,
            "mbtiles_minzoom": None,
            "mbtiles_maxzoom": None,
            "pinned": False,
            "unfiltered": False,
            "userinfo": False,
        }
    ],
}


class TestMyExportJobs:
    """Tests for GET /export-tool/jobs/me endpoint"""

    @pytest.mark.asyncio
    async def test_get_my_jobs_success(self):
        """Test successful retrieval of authenticated user's export jobs"""
        mock_response = Mock()
        mock_response.json.return_value = MOCK_MY_JOBS_RESPONSE
        mock_response.raise_for_status = Mock()

        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"
        mock_user.username = "testuser"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.export_tool.export_tool import get_my_export_jobs

            result = await get_my_export_jobs(
                request=mock_request, user=mock_user,
                limit=20, offset=0,
            )

            assert result == MOCK_MY_JOBS_RESPONSE
            assert result["count"] == 1
            assert result["results"][0]["uid"] == "ac94424d-7d0e-45d6-a7a8-8f81cb07fb2c"

            # Verify the request was made with correct params
            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            assert f"{BASE_URL}/jobs" in call_args[0][0]
            params = call_args[1]["params"]
            assert params["all"] == "false"
            assert params["limit"] == 20
            assert params["offset"] == 0

            # Verify hanko cookie is forwarded
            cookies = call_args[1]["cookies"]
            assert cookies["hanko"] == "test-hanko-jwt"

    @pytest.mark.asyncio
    async def test_get_my_jobs_with_filters(self):
        """Test with search and status filters"""
        mock_response = Mock()
        mock_response.json.return_value = {"count": 0, "next": None, "previous": None, "results": []}
        mock_response.raise_for_status = Mock()

        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.export_tool.export_tool import get_my_export_jobs

            result = await get_my_export_jobs(
                request=mock_request,
                user=mock_user,
                limit=10,
                offset=5,
                search="buenos aires",
                status="COMPLETED",
            )

            call_args = mock_client.return_value.__aenter__.return_value.get.call_args
            params = call_args[1]["params"]
            assert params["limit"] == 10
            assert params["offset"] == 5
            assert params["search"] == "buenos aires"
            assert params["status"] == "COMPLETED"
            assert params["all"] == "false"

    @pytest.mark.asyncio
    async def test_get_my_jobs_no_cookie(self):
        """Test returns 401 when hanko cookie is missing"""
        mock_request = Mock()
        mock_request.cookies.get.return_value = None

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        from app.api.routes.export_tool.export_tool import get_my_export_jobs

        with pytest.raises(Exception) as exc_info:
            await get_my_export_jobs(request=mock_request, user=mock_user)

        assert exc_info.value.status_code == 401
        assert "Hanko auth cookie not found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_my_jobs_upstream_error(self):
        """Test handling of HTTP errors from Export Tool API"""
        mock_request_obj = Mock()
        mock_request_obj.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        mock_response = Mock()
        mock_response.status_code = 403
        mock_response.text = "Forbidden"
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "403 Forbidden", request=Mock(), response=mock_response
        )

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )

            from app.api.routes.export_tool.export_tool import get_my_export_jobs

            with pytest.raises(Exception) as exc_info:
                await get_my_export_jobs(request=mock_request_obj, user=mock_user)

            assert exc_info.value.status_code == 403
            assert "Error from HOT Export Tool API" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_my_jobs_connection_error(self):
        """Test handling of connection errors"""
        mock_request = Mock()
        mock_request.cookies.get.return_value = "test-hanko-jwt"

        mock_user = Mock()
        mock_user.id = "test-hanko-uuid"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=Exception("Connection refused")
            )

            from app.api.routes.export_tool.export_tool import get_my_export_jobs

            with pytest.raises(Exception) as exc_info:
                await get_my_export_jobs(request=mock_request, user=mock_user)

            assert exc_info.value.status_code == 500
            assert "Connection refused" in exc_info.value.detail


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

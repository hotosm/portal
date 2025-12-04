import pytest
import respx
from fastapi.testclient import TestClient
from fastapi import FastAPI
import httpx
from datetime import datetime

from app.api.routes.export_tool.export_tool import router
from app.models.export_tool import ExportJobsResponse, ExportJob, User, ExportFormat

app = FastAPI()
app.include_router(router)

client = TestClient(app)

MOCK_EXPORT_JOBS_RESPONSE = {
    "count": 2,
    "next": None,
    "previous": None,
    "results": [
        {
            "uid": "test-job-123",
            "name": "Test Export Job 1",
            "description": "Test description",
            "event": "test-event",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-02T00:00:00Z",
            "owner": {
                "username": "testuser",
                "id": 1
            },
            "region": {
                "id": 1,
                "name": "Test Region",
                "description": "Test region description"
            },
            "extent": {
                "type": "Polygon",
                "coordinates": [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
            },
            "published": True,
            "featured": False,
            "pinned": True,
            "status": "COMPLETED",
            "formats": [
                {
                    "uid": "format-123",
                    "url": "https://example.com/download.zip",
                    "name": "Shapefile",
                    "size": 1024.5,
                    "deleted": False
                }
            ]
        },
        {
            "uid": "test-job-456",
            "name": "Test Export Job 2",
            "description": "Another test",
            "created_at": "2024-01-03T00:00:00Z",
            "owner": {
                "username": "testuser2"
            },
            "published": False,
            "pinned": True,
            "status": "RUNNING",
            "formats": []
        }
    ]
}

MOCK_JOB_DETAIL_RESPONSE = {
    "uid": "test-job-123",
    "name": "Test Export Job Detail",
    "description": "Detailed test job",
    "created_at": "2024-01-01T00:00:00Z",
    "status": "COMPLETED",
    "owner": {
        "username": "testuser",
        "id": 1
    },
    "formats": []
}


class TestExportToolEndpoints:
    """Tests for Export Tool API endpoints"""
    
    @respx.mock
    def test_get_export_jobs_success(self):
        """Test successful retrieval of export jobs"""
        respx.get("https://export.hotosm.org/api/jobs").mock(
            return_value=httpx.Response(200, json=MOCK_EXPORT_JOBS_RESPONSE)
        )
        
        response = client.get("/export-tool/jobs?pinned=true&all=true&limit=20&offset=0")
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["results"]) == 2
        assert data["results"][0]["uid"] == "test-job-123"
        assert data["results"][0]["name"] == "Test Export Job 1"
        assert data["results"][0]["status"] == "COMPLETED"
    
    @respx.mock
    def test_get_export_jobs_with_filters(self):
        """Test export jobs retrieval with additional filters"""
        respx.get("https://export.hotosm.org/api/jobs").mock(
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
        respx.get("https://export.hotosm.org/api/jobs").mock(
            return_value=httpx.Response(404, text="Not Found")
        )
        
        response = client.get("/export-tool/jobs")
        
        assert response.status_code == 404
        assert "Error from HOT Export Tool API" in response.json()["detail"]
    
    @respx.mock
    def test_get_export_jobs_generic_error(self):
        """Test handling of generic errors"""
        respx.get("https://export.hotosm.org/api/jobs").mock(
            side_effect=Exception("Connection error")
        )
        
        response = client.get("/export-tool/jobs")
        
        assert response.status_code == 500
        assert "Connection error" in response.json()["detail"]
    
    @respx.mock
    def test_get_export_job_detail_success(self):
        """Test successful retrieval of job detail"""
        respx.get("https://export.hotosm.org/api/jobs/test-job-123").mock(
            return_value=httpx.Response(200, json=MOCK_JOB_DETAIL_RESPONSE)
        )
        
        response = client.get("/export-tool/jobs/test-job-123")
        
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "test-job-123"
        assert data["name"] == "Test Export Job Detail"
        assert data["status"] == "COMPLETED"
    
    @respx.mock
    def test_get_export_job_detail_not_found(self):
        """Test job detail retrieval with non-existent job"""
        respx.get("https://export.hotosm.org/api/jobs/non-existent-job").mock(
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
        respx.get("https://export.hotosm.org/api/jobs").mock(
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
        assert "uid" in job
        assert "name" in job
        assert "created_at" in job
        assert "status" in job
        assert "formats" in job


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
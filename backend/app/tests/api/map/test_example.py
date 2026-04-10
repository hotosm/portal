"""Tests for example API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_success(client: AsyncClient):
    """
    Test that health check endpoint returns 200 with correct structure.

    This test demonstrates:
    - Testing GET endpoints
    - Verifying response status codes
    - Validating response JSON structure
    - Checking field types and values
    """
    response = await client.get("/api/health-check")

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert isinstance(data["timestamp"], str)
    assert data["database"]["connected"] is True
    assert isinstance(data["database"]["response_time_ms"], (int, float))
    assert data["message"] == "API is running"


@pytest.mark.asyncio
async def test_health_check_response_structure(client: AsyncClient):
    """Test that health check response has all required fields."""
    response = await client.get("/api/health-check")

    assert response.status_code == 200

    data = response.json()
    required_fields = ["status", "timestamp", "database", "message"]

    for field in required_fields:
        assert field in data, f"Missing required field: {field}"

    # Validate database object structure
    assert "connected" in data["database"]
    assert "response_time_ms" in data["database"]


@pytest.mark.asyncio
async def test_health_check_database_timing(client: AsyncClient):
    """Test that database response time is measured."""
    response = await client.get("/api/health-check")

    assert response.status_code == 200

    data = response.json()
    response_time = data["database"]["response_time_ms"]

    assert response_time is not None
    assert isinstance(response_time, (int, float))
    assert response_time >= 0


@pytest.mark.asyncio
async def test_main_health_endpoint(client: AsyncClient):
    """Test the main /health endpoint (for K8s liveness probe)."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_main_ready_endpoint(client: AsyncClient):
    """Test the main /ready endpoint (for K8s readiness probe)."""
    response = await client.get("/ready")

    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert isinstance(data["database"], bool)


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test the root endpoint returns welcome message."""
    response = await client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data
    assert data["message"] == "Welcome to Portal API"

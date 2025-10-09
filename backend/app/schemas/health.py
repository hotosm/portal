"""Health check schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class DatabaseStatus(BaseModel):
    """Database connection status."""

    connected: bool = Field(..., description="Whether database is connected")
    response_time_ms: float | None = Field(None, description="Database response time in milliseconds")


class HealthCheckResponse(BaseModel):
    """Health check response model."""

    status: str = Field(..., description="Overall status", examples=["ok", "error"])
    timestamp: datetime = Field(..., description="Response timestamp")
    database: DatabaseStatus = Field(..., description="Database connection status")
    message: str = Field(..., description="Human-readable status message")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "timestamp": "2025-01-01T12:00:00Z",
                "database": {"connected": True, "response_time_ms": 5.2},
                "message": "API is running",
            }
        }
    }

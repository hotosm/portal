"""Example API endpoints."""

import time
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.health import DatabaseStatus, HealthCheckResponse

router = APIRouter()


async def check_database_health(db: AsyncSession) -> DatabaseStatus:
    """
    Check database connection and measure response time.

    Args:
        db: Database session

    Returns:
        DatabaseStatus: Database health status with response time
    """
    try:
        start_time = time.time()
        await db.execute(text("SELECT 1"))
        response_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        return DatabaseStatus(connected=True, response_time_ms=round(response_time, 2))
    except Exception:
        return DatabaseStatus(connected=False, response_time_ms=None)


@router.get("/health-check", response_model=HealthCheckResponse)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthCheckResponse:
    """
    Example health check endpoint showing API interaction with database.

    This endpoint demonstrates:
    - FastAPI endpoint with Pydantic response models
    - Database connection dependency injection
    - Async database operations
    - Error handling

    Returns:
        HealthCheckResponse: API status including database connectivity

    Example:
        ```bash
        curl http://localhost:8000/api/health-check
        ```

    Response:
        ```json
        {
          "status": "ok",
          "timestamp": "2025-01-01T12:00:00Z",
          "database": {
            "connected": true,
            "response_time_ms": 5.2
          },
          "message": "API is running"
        }
        ```
    """
    db_status = await check_database_health(db)

    status = "ok" if db_status.connected else "error"
    message = "API is running" if db_status.connected else "Database connection failed"

    return HealthCheckResponse(
        status=status,
        timestamp=datetime.now(),
        database=db_status,
        message=message,
    )

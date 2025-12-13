"""Pytest configuration and fixtures."""

from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.cache import clear_cache
from app.main import app


@pytest.fixture(autouse=True)
def clear_cache_before_test():
    """Clear the cache before each test to ensure isolation."""
    clear_cache()
    yield
    clear_cache()

# Test database URL (using in-memory SQLite for simplicity)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend():
    """Use asyncio backend for pytest-asyncio."""
    return "asyncio"


@pytest.fixture
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def test_db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session


@pytest.fixture
async def client(test_db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create test client with database session override.

    This fixture provides an AsyncClient for testing API endpoints
    with a test database session.
    """

    async def override_get_db():
        yield test_db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def mock_db_failure():
    """
    Mock database failure for testing error handling.

    Usage:
        ```python
        async def test_with_db_failure(client, mock_db_failure):
            response = await client.get("/api/health-check")
            assert response.status_code == 200
            assert response.json()["database"]["connected"] is False
        ```
    """
    with patch(
        "app.api.routes.example.check_database_health",
        return_value=AsyncMock(connected=False, response_time_ms=None),
    ):
        yield

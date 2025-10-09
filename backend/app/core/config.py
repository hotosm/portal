"""Application configuration using Pydantic settings."""

from pathlib import Path
from typing import Annotated

from pydantic import BeforeValidator, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the project root directory (2 levels up from this file)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


def parse_cors_origins(v: str | list[str]) -> list[str]:
    """Parse CORS origins from comma-separated string or list."""
    if isinstance(v, str):
        return [origin.strip() for origin in v.split(",")]
    return v


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        # Only use .env file if it exists, otherwise rely on environment variables
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # API Settings
    project_name: str = "Portal API"
    version: str = "1.0.0"
    api_v1_prefix: str = "/api"
    debug: bool = False

    # Database Settings
    database_url: PostgresDsn
    db_echo: bool = False

    # CORS Settings
    backend_cors_origins: Annotated[
        list[str], BeforeValidator(parse_cors_origins)
    ] = ["http://localhost:5173"]


settings = Settings()

"""Application configuration using Pydantic settings."""

from enum import Enum
from pathlib import Path
from typing import Annotated

from pydantic import BeforeValidator, Field, PostgresDsn, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


def parse_cors_origins(v: str | list[str]) -> list[str]:
    """Parse CORS origins from comma-separated string or list."""
    if isinstance(v, str):
        return [origin.strip() for origin in v.split(",")]
    return v


class Environment(str, Enum):
    LOCAL = "local"
    TEST = "test"
    PRODUCTION = "production"


ENV_DEFAULTS: dict[Environment, dict[str, str]] = {
    Environment.LOCAL: {
        "hanko_api_url": "https://login.hotosm.test",
        "drone_tm_base_url": "https://drone.hotosm.org",
        "fair_base_url": "https://api-prod.fair.hotosm.org",
        "oam_api_url": "https://openaerialmap.hotosm.test/api",
        "umap_base_url": "https://umap.hotosm.org",
        "chatmap_base_url": "https://chatmap.hotosm.org",
        "tasking_manager_api_url": "https://tasking-manager-production-api.hotosm.org/api/v2",
        "export_tool_base_url": "https://export-tool.hotosm.test",
        "field_tm_base_url": "https://field.hotosm.test",
    },
    Environment.TEST: {
        "hanko_api_url": "https://dev.login.hotosm.org",
        "drone_tm_base_url": "https://dev.drone.hotosm.org",
        "fair_base_url": "https://dev.fair.hotosm.org",
        "oam_api_url": "https://api.openaerialmap.org",
        "umap_base_url": "https://umap.hotosm.org",
        "chatmap_base_url": "https://chatmap.hotosm.org",
        "tasking_manager_api_url": "https://tasking-manager-production-api.hotosm.org/api/v2",
        "export_tool_base_url": "https://export.hotosm.org",
        "field_tm_base_url": "https://field.hotosm.org",
    },
    Environment.PRODUCTION: {
        "hanko_api_url": "https://login.hotosm.org",
        "drone_tm_base_url": "https://drone.hotosm.org",
        "fair_base_url": "https://api-prod.fair.hotosm.org",
        "oam_api_url": "https://api.openaerialmap.org",
        "umap_base_url": "https://umap.hotosm.org",
        "chatmap_base_url": "https://chatmap.hotosm.org",
        "tasking_manager_api_url": "https://tasking-manager-production-api.hotosm.org/api/v2",
        "export_tool_base_url": "https://export.hotosm.org",
        "field_tm_base_url": "https://field.hotosm.org",
    },
}


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Environment is auto-detected from PORTAL_BASE_URL:
      - *.hotosm.test  -> local
      - dev.*           -> test
      - otherwise       -> production

    All service URLs default to the detected environment.
    Individual URLs can be overridden via env vars.
    """

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Required ---
    portal_base_url: str
    database_url: PostgresDsn
    cookie_secret: str

    # --- General ---
    project_name: str = "Portal API"
    version: str = "1.0.0"
    api_v1_prefix: str = "/api"
    debug: bool = False
    db_echo: bool = False
    backend_cors_origins: Annotated[
        list[str], BeforeValidator(parse_cors_origins)
    ] = ["http://localhost:5173"]
    cookie_domain: str | None = None

    # --- OSM OAuth ---
    osm_client_id: str | None = None
    osm_client_secret: str | None = None

    # --- Service Base URLs (auto-filled from detected environment) ---
    hanko_api_url: str | None = None
    drone_tm_base_url: str | None = None
    fair_base_url: str | None = None
    oam_api_url: str | None = None
    umap_base_url: str | None = None
    chatmap_base_url: str | None = None
    tasking_manager_api_url: str | None = None
    export_tool_base_url: str | None = None
    field_tm_base_url: str | None = None

    # --- Legacy env vars (override base URLs if set) ---
    drone_tm_backend_url: str | None = None
    fair_backend_url: str | None = None
    fair_api_base_url: str | None = None
    export_tool_api_base_url: str | None = None
    chatmap_api_base_url: str | None = None
    oam_stac_api_url: str | None = None

    # --- Service-specific settings ---
    drone_tm_auth_header: str = "Authorization"
    drone_tm_auth_prefix: str = "Bearer"
    drone_tm_verify_ssl: bool = False
    fair_verify_ssl: bool = True
    umap_locale: str = "es"
    homepage_map_sync_interval_hours: int = 7

    # --- Computed (not from env) ---
    detected_environment: Environment = Field(
        default=Environment.PRODUCTION, exclude=True
    )

    @model_validator(mode="after")
    def detect_env_and_fill_defaults(self) -> "Settings":
        url = self.portal_base_url.lower()
        if ".test" in url:
            self.detected_environment = Environment.LOCAL
        elif "://dev." in url:
            self.detected_environment = Environment.TEST
        else:
            self.detected_environment = Environment.PRODUCTION

        defaults = ENV_DEFAULTS[self.detected_environment]

        for field_name, default_value in defaults.items():
            if getattr(self, field_name) is None:
                setattr(self, field_name, default_value)

        # Legacy env vars override the new base URL fields
        if self.drone_tm_backend_url and self.drone_tm_base_url == defaults.get("drone_tm_base_url"):
            self.drone_tm_base_url = self.drone_tm_backend_url.rstrip("/").removesuffix("/api")
        if self.fair_backend_url and self.fair_base_url == defaults.get("fair_base_url"):
            self.fair_base_url = self.fair_backend_url.rstrip("/").removesuffix("/api/v1").removesuffix("/api")
        if self.fair_api_base_url and self.fair_base_url == defaults.get("fair_base_url"):
            self.fair_base_url = self.fair_api_base_url.rstrip("/").removesuffix("/api/v1").removesuffix("/api")
        if self.export_tool_api_base_url and self.export_tool_base_url == defaults.get("export_tool_base_url"):
            self.export_tool_base_url = self.export_tool_api_base_url.rstrip("/").removesuffix("/api")
        if self.chatmap_api_base_url and self.chatmap_base_url == defaults.get("chatmap_base_url"):
            self.chatmap_base_url = self.chatmap_api_base_url.rstrip("/").removesuffix("/api/v1").removesuffix("/api")
        if self.oam_stac_api_url and self.oam_api_url == defaults.get("oam_api_url"):
            self.oam_api_url = self.oam_stac_api_url

        return self

    # --- Computed API URL properties ---

    @property
    def drone_tm_api_url(self) -> str:
        """Drone TM API: base + /api"""
        return f"{self.drone_tm_base_url}/api"

    @property
    def fair_api_url(self) -> str:
        """fAIr API: base + /api/v1"""
        return f"{self.fair_base_url}/api/v1"

    @property
    def chatmap_api_url(self) -> str:
        """ChatMap API: base + /api/v1"""
        return f"{self.chatmap_base_url}/api/v1"

    @property
    def export_tool_api_url(self) -> str:
        """Export Tool API: base + /api"""
        return f"{self.export_tool_base_url}/api"


settings = Settings()

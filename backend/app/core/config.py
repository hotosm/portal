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
        "fair_base_url": "https://fair.hotosm.test",
        "oam_api_url": "https://openaerialmap.hotosm.test/api",
        "umap_base_url": "https://umap.hotosm.test",
        "chatmap_base_url": "https://chatmap.hotosm.test",
        "tasking_manager_api_url": "https://tasking-manager-production-api.hotosm.org/api/v2",
        "export_tool_base_url": "https://export-tool.hotosm.test",
        "field_tm_base_url": "https://field.hotosm.test",
    },
    Environment.TEST: {
        "hanko_api_url": "https://dev.login.hotosm.org",
        "drone_tm_base_url": "https://dev.drone.hotosm.org",
        "fair_base_url": "https://fair-dev.hotosm.org",
        "oam_api_url": "https://api.openaerialmap.org",
        "umap_base_url": "https://umap.hotosm.org",
        "chatmap_base_url": "https://chatmap-dev.hotosm.org/",
        "tasking_manager_api_url": "https://tasking-manager-production-api.hotosm.org/api/v2",
        "export_tool_base_url": "https://export.hotosm.org",
        "field_tm_base_url": "https://field.hotosm.org",
    },
    Environment.PRODUCTION: {
        "hanko_api_url": "https://login.hotosm.org",
        "drone_tm_base_url": "https://drone.hotosm.org",
        "drone_tm_api_base_url": "https://api.drone.hotosm.org",
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
        env_ignore_empty=True,
    )

    # --- Required ---
    portal_base_url: str | None = None
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

    # --- Service API URLs (override derived api URLs if set) ---
    drone_tm_api_base_url: str | None = None

    # --- Legacy env vars (override base URLs if set) ---
    drone_tm_backend_url: str | None = None
    fair_backend_url: str | None = None
    fair_api_base_url: str | None = None
    export_tool_api_base_url: str | None = None
    chatmap_api_base_url: str | None = None
    oam_stac_api_url: str | None = None

    # fAIr URL for user-specific endpoints (auth/status, me/models).
    # Defaults to fair_base_url. Override in local dev to point at fair.hotosm.test
    # while fair_base_url still points at production for the public map.
    fair_user_base_url: str | None = None

    # --- Service-specific settings ---
    drone_tm_auth_header: str = "Authorization"
    drone_tm_auth_prefix: str = "Bearer"
    drone_tm_verify_ssl: bool | None = None
    fair_verify_ssl: bool | None = None
    umap_locale: str = "es"
    homepage_map_sync_interval_hours: int = 7

    # --- Computed (not from env) ---
    detected_environment: Environment = Field(
        default=Environment.PRODUCTION, exclude=True
    )

    @model_validator(mode="after")
    def detect_env_and_fill_defaults(self) -> "Settings":
        url = (self.portal_base_url or self.hanko_api_url or "").lower()
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

        # Legacy env vars override the new base URL fields.
        # Each tuple: (legacy_attr, base_attr, suffixes_to_strip_in_order)
        legacy_overrides = [
            ("drone_tm_backend_url", "drone_tm_base_url", ["/api"]),
            ("fair_backend_url",     "fair_base_url",     ["/api/v1", "/api"]),
            ("fair_api_base_url",    "fair_base_url",     ["/api/v1", "/api"]),
            ("export_tool_api_base_url", "export_tool_base_url", ["/api"]),
            ("chatmap_api_base_url", "chatmap_base_url",  ["/api/v1", "/api"]),
            ("oam_stac_api_url",     "oam_api_url",       []),
        ]
        for legacy_attr, base_attr, suffixes in legacy_overrides:
            legacy_val = getattr(self, legacy_attr, None)
            if legacy_val and getattr(self, base_attr) == defaults.get(base_attr):
                base = legacy_val.rstrip("/")
                for suffix in suffixes:
                    base = base.removesuffix(suffix)
                setattr(self, base_attr, base)

        # SSL verification defaults: disabled on LOCAL/TEST (self-signed certs), enabled on PRODUCTION.
        prod = self.detected_environment == Environment.PRODUCTION
        if self.fair_verify_ssl is None:
            self.fair_verify_ssl = prod
        if self.drone_tm_verify_ssl is None:
            self.drone_tm_verify_ssl = False

        # fair_user_base_url falls back to fair_base_url when not set.
        if not self.fair_user_base_url:
            self.fair_user_base_url = self.fair_base_url

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
    def fair_user_api_url(self) -> str:
        """fAIr user API: base + /api/v1 (used for auth/status and me/models)."""
        return f"{self.fair_user_base_url}/api/v1"

    @property
    def fair_user_verify_ssl(self) -> bool:
        """SSL verification for fair_user_api_url: auto-disabled for .test domains."""
        return ".test" not in (self.fair_user_base_url or "").lower()

    @property
    def chatmap_api_url(self) -> str:
        """ChatMap API: base + /api/v1"""
        return f"{self.chatmap_base_url}/api/v1"

    @property
    def export_tool_api_url(self) -> str:
        """Export Tool API: base + /api"""
        return f"{self.export_tool_base_url}/api"


settings = Settings()

"""Authentication response schemas."""

from pydantic import BaseModel, Field


class UserInfoResponse(BaseModel):
    """User information response."""

    message: str = Field(..., description="Success message")
    user_id: str = Field(..., description="Hanko user ID")
    email: str | None = Field(None, description="User email")
    username: str | None = Field(None, description="User username")

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "You are logged in",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "username": "mapper123",
            }
        }
    }


class OSMInfoResponse(BaseModel):
    """OSM connection information response."""

    message: str = Field(..., description="Success message")
    osm_user_id: int = Field(..., description="OSM user ID")
    osm_username: str = Field(..., description="OSM username")
    osm_avatar_url: str | None = Field(None, description="OSM avatar URL")

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "You are connected to OSM",
                "osm_user_id": 12345,
                "osm_username": "mapper123",
                "osm_avatar_url": "https://www.openstreetmap.org/avatar.jpg",
            }
        }
    }

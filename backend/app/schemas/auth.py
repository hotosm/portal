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

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    tool: str | None = None
    project_app: str | None = None
    project_id: str | None = None

    @model_validator(mode="after")
    def check_project_link(self) -> "TaskCreate":
        if (self.project_app is None) != (self.project_id is None):
            raise ValueError("project_app and project_id must both be set or both be absent")
        return self


class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1)
    tool: str | None = None
    project_app: str | None = None
    project_id: str | None = None

    @model_validator(mode="after")
    def check_project_link(self) -> "TaskUpdate":
        if (self.project_app is None) != (self.project_id is None):
            raise ValueError("project_app and project_id must both be set or both be absent")
        return self


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    tool: str | None
    project_app: str | None
    project_id: str | None
    created_at: datetime
    updated_at: datetime

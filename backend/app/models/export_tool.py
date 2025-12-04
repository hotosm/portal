from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime


class User(BaseModel):
    """User information"""
    username: str
    id: Optional[int] = None


class Region(BaseModel):
    """Region information"""
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


class ExportFormat(BaseModel):
    """Export format details"""
    uid: str
    url: str
    name: Optional[str] = None
    description: Optional[str] = None
    size: Optional[float] = None
    deleted: Optional[bool] = False


class ExportJob(BaseModel):
    """Individual export job"""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    uid: str
    name: str
    description: Optional[str] = None
    event: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: Optional[User] = None
    region: Optional[Region] = None
    extent: Optional[Any] = None  # GeoJSON geometry
    published: Optional[bool] = False
    featured: Optional[bool] = False
    pinned: Optional[bool] = False
    status: Optional[str] = None
    formats: Optional[List[ExportFormat]] = []


class ExportJobsResponse(BaseModel):
    """Response model for export jobs list"""
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[ExportJob]
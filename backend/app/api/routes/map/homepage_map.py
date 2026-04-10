"""Unified homepage map API backed by Postgres."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.homepage_map import HomePageMapSnapshotResponse
from app.services import map_projects_service

router = APIRouter(prefix="/homepage-map")


@router.get("/projects/snapshot", response_model=HomePageMapSnapshotResponse)
async def get_homepage_map_snapshot(
    db: AsyncSession = Depends(get_db),
    refresh: bool = Query(False, description="Force refresh from source APIs before reading DB"),
) -> dict:
    """Return all homepage map projects as a unified GeoJSON FeatureCollection."""
    try:
        if refresh:
            await map_projects_service.sync_from_sources(db)
        return await map_projects_service.query_map_projects(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""SQLAlchemy model that stores incremental sync cursor per product."""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String

from app.core.base import Base


class MapProjectSyncState(Base):
    """Tracks the latest synced cursor (created_at + identity) for each product."""

    __tablename__ = "map_project_sync_state"

    product = Column(String, primary_key=True)
    last_created_at = Column(DateTime(timezone=True), nullable=True)
    last_identity = Column(String, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

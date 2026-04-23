"""SQLAlchemy ORM model for unified homepage map projects."""

from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, Float, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB

from app.core.base import Base


class MapProject(Base):
    """Stores normalized map project centroids across all Portal products."""

    __tablename__ = "map_projects"

    id = Column(String, primary_key=True)
    product = Column(String, nullable=False)
    project_id = Column(String, nullable=False)
    name = Column(String, nullable=True)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    metadata_json = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    synced_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("product", "project_id", name="uq_map_projects_product_project_id"),
        Index("idx_map_projects_product", "product"),
        Index("idx_map_projects_product_project_id", "product", "project_id"),
    )

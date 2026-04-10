"""SQLAlchemy ORM model for OpenAerialMap imagery."""

from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import ARRAY

from app.core.base import Base


class OAMImage(Base):
    """Stores public OAM imagery metadata synced from the OAM API."""

    __tablename__ = "oam_images"

    id = Column(String, primary_key=True)  # _id from OAM
    title = Column(String, nullable=True)
    bbox = Column(ARRAY(Float), nullable=True)  # [min_lon, min_lat, max_lon, max_lat]
    geometry = Column(
        Geometry("POLYGON", srid=4326), nullable=True
    )  # PostGIS polygon for spatial queries
    gsd = Column(Float, nullable=True)
    acquisition_end = Column(DateTime(timezone=True), nullable=True)
    provider = Column(String, nullable=True)
    tms_url = Column(String, nullable=True)  # NULL means no tiles (has_tiled=False)
    thumbnail_url = Column(String, nullable=True)
    synced_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("idx_oam_images_acq", "acquisition_end"),
        Index("idx_oam_images_geom", "geometry", postgresql_using="gist"),
    )

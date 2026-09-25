"""SQLAlchemy ORM model for portal-owned profile-page extras."""

from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, String, Text

from app.core.base import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class PortalProfile(Base):
    """Portal-owned additions to a user's profile (account identity lives in login)."""

    __tablename__ = "portal_profiles"

    hanko_user_id = Column(String(36), primary_key=True)
    bio = Column(Text, nullable=True)
    location = Column(String(200), nullable=True)
    contact_email = Column(String(254), nullable=True)
    phone = Column(String(32), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    show_organizations = Column(Boolean, nullable=False, default=False)
    show_teams = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

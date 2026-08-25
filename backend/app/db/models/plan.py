"""SQLAlchemy ORM models for user-owned plans that group external projects."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.base import Base

# A plan's scope + visibility model:
#   * owner_id      — always the creator; the owner can always view/edit.
#   * group_type    — None for a personal plan, else "team" | "organization".
#   * group_id      — the login group id when the plan belongs to a group.
#   * visibility    — "private" | "group" | "public" (replaces the old is_public
#                     boolean; the property below preserves that name for reads).
#   * edit_scope    — "owner" | "group" (who, besides the owner, may edit).


def uuid_str() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(UTC)


class Plan(Base):
    """A user-owned collection of project references across portal apps."""

    __tablename__ = "plans"

    id = Column(String, primary_key=True, default=uuid_str)
    owner_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    visibility = Column(String, nullable=False, default="private")
    group_type = Column(String, nullable=True)
    group_id = Column(String, nullable=True)
    edit_scope = Column(String, nullable=False, default="owner")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

    __table_args__ = (Index("ix_plans_group", "group_type", "group_id"),)

    @property
    def is_public(self) -> bool:
        """Back-compat read accessor; visibility is the source of truth."""
        return self.visibility == "public"

    projects = relationship(
        "PlanProject",
        back_populates="plan",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="PlanProject.display_order",
    )

    collections = relationship(
        "PlanCollection",
        back_populates="plan",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="PlanCollection.display_order",
    )

    images = relationship(
        "PlanImage",
        back_populates="plan",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="PlanImage.display_order",
    )


class PlanCollection(Base):
    """A named section of a plan that groups some of its projects/tasks.

    Owned by the plan, not by a user: everyone who can edit the plan sees and
    edits the same collections. A project belongs to at most one collection
    (PlanProject.collection_id); no row means the virtual "All" bucket.
    """

    __tablename__ = "plan_collections"

    id = Column(String, primary_key=True, default=uuid_str)
    plan_id = Column(
        String,
        ForeignKey("plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

    __table_args__ = (UniqueConstraint("plan_id", "name", name="uq_plan_collections_plan_name"),)

    plan = relationship("Plan", back_populates="collections")
    projects = relationship("PlanProject", back_populates="collection")


class PlanProject(Base):
    """A reference inside a plan to an external project in one of the 7 apps."""

    __tablename__ = "plan_projects"

    id = Column(String, primary_key=True, default=uuid_str)
    plan_id = Column(
        String,
        ForeignKey("plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Null means the project sits in the virtual "All" bucket. SET NULL so
    # deleting a collection sends its projects back there.
    collection_id = Column(
        String,
        ForeignKey("plan_collections.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    app = Column(String, nullable=True)
    project_id = Column(String, nullable=True)
    project_exists = Column(Boolean, nullable=False, default=True)
    status = Column(String, nullable=False, default="in_progress")
    # Position inside the project's collection (or inside "All" when unassigned).
    display_order = Column(Integer, nullable=False, default=0)
    featured = Column(Boolean, nullable=False, default=False)
    data = Column(JSON().with_variant(JSONB, "postgresql"), nullable=True)
    added_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    plan = relationship("Plan", back_populates="projects")
    collection = relationship("PlanCollection", back_populates="projects")

    __table_args__ = (
        UniqueConstraint("plan_id", "app", "project_id", name="uq_plan_projects_plan_app_project"),
        Index("idx_plan_projects_app_project_id", "app", "project_id"),
    )


class PlanImage(Base):
    """An image attached to a plan, stored in S3/MinIO."""

    __tablename__ = "plan_images"

    id = Column(String, primary_key=True, default=uuid_str)
    plan_id = Column(
        String,
        ForeignKey("plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    s3_key = Column(String, nullable=False)
    url = Column(String, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    plan = relationship("Plan", back_populates="images")

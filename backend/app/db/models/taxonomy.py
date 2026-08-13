"""SQLAlchemy ORM models for open-text taxonomies attached to plan projects.

Group and Tag share the same ownership/scope model as Plan (see
app/db/models/plan.py): owner_id is the creator, and group_type/group_id
optionally share the entity with every member of a login team/organization.
That group_type/group_id pair refers to the *login* group (team/org) that
owns the entity — unrelated to the Group entity defined below, which is a
user-created label for organizing plan projects/tasks, not a team.
"""

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.base import Base
from app.db.models.plan import utcnow, uuid_str


class Group(Base):
    """An open-text label a user can attach to plan projects/tasks."""

    __tablename__ = "groups"

    id = Column(String, primary_key=True, default=uuid_str)
    owner_id = Column(String, nullable=False, index=True)
    group_type = Column(String, nullable=True)
    group_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "owner_id", "group_type", "group_id", "name", name="uq_groups_scope_name"
        ),
    )

    plan_projects = relationship(
        "PlanProject", secondary="plan_project_groups", back_populates="groups"
    )


class Tag(Base):
    """An open-text label a user can attach to plan projects/tasks."""

    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=uuid_str)
    owner_id = Column(String, nullable=False, index=True)
    group_type = Column(String, nullable=True)
    group_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "owner_id", "group_type", "group_id", "name", name="uq_tags_scope_name"
        ),
    )

    plan_projects = relationship(
        "PlanProject", secondary="plan_project_tags", back_populates="tags"
    )


plan_project_groups = Table(
    "plan_project_groups",
    Base.metadata,
    Column(
        "plan_project_id",
        String,
        ForeignKey("plan_projects.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "group_id", String, ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True
    ),
)

plan_project_tags = Table(
    "plan_project_tags",
    Base.metadata,
    Column(
        "plan_project_id",
        String,
        ForeignKey("plan_projects.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

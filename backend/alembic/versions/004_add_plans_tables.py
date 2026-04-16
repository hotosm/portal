"""add plans and plan_projects tables

Revision ID: 004_add_plans_tables
Revises: 003_add_map_project_sync_state
Create Date: 2026-04-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "004_add_plans_tables"
down_revision = "003_add_map_project_sync_state"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "plans",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_plans_owner_id", "plans", ["owner_id"])

    op.create_table(
        "plan_projects",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("plan_id", sa.String(), nullable=False),
        sa.Column("app", sa.String(), nullable=False),
        sa.Column("project_id", sa.String(), nullable=False),
        sa.Column(
            "data",
            sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql"),
            nullable=True,
        ),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "plan_id", "app", "project_id", name="uq_plan_projects_plan_app_project"
        ),
    )
    op.create_index("ix_plan_projects_plan_id", "plan_projects", ["plan_id"])
    op.create_index(
        "idx_plan_projects_app_project_id", "plan_projects", ["app", "project_id"]
    )


def downgrade() -> None:
    op.drop_index("idx_plan_projects_app_project_id", table_name="plan_projects")
    op.drop_index("ix_plan_projects_plan_id", table_name="plan_projects")
    op.drop_table("plan_projects")
    op.drop_index("ix_plans_owner_id", table_name="plans")
    op.drop_table("plans")

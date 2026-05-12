"""add display_order column to plan_projects

Revision ID: 008_add_plan_project_display_order
Revises: 007_add_plan_project_status
Create Date: 2026-05-11
"""

from alembic import op
import sqlalchemy as sa

revision = "008_plan_project_order"
down_revision = "007_add_plan_project_status"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "plan_projects",
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("plan_projects", "display_order")

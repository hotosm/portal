"""Add featured column to plan_projects.

Revision ID: 012_add_plan_project_featured
Revises: 011_convert_empty_slots
Create Date: 2026-06-26
"""

from alembic import op
import sqlalchemy as sa

revision = "012_add_plan_project_featured"
down_revision = "011_convert_empty_slots"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "plan_projects",
        sa.Column("featured", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("plan_projects", "featured")

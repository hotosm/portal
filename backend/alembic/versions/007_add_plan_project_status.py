"""add status column to plan_projects

Revision ID: 007_add_plan_project_status
Revises: 006_add_plan_images
Create Date: 2026-05-08
"""

from alembic import op
import sqlalchemy as sa

revision = "007_add_plan_project_status"
down_revision = "006_add_plan_images"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "plan_projects",
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default="in_progress",
        ),
    )


def downgrade() -> None:
    op.drop_column("plan_projects", "status")

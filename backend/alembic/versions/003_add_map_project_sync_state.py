"""add map_project_sync_state table

Revision ID: 003_add_map_project_sync_state
Revises: 002_add_map_projects_table
Create Date: 2026-03-02
"""

from alembic import op
import sqlalchemy as sa


revision = "003_add_map_project_sync_state"
down_revision = "002_add_map_projects_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "map_project_sync_state",
        sa.Column("product", sa.String(), nullable=False),
        sa.Column("last_created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_identity", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("product"),
    )


def downgrade() -> None:
    op.drop_table("map_project_sync_state")

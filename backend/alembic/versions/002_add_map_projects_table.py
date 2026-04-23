"""add map_projects table

Revision ID: 002_add_map_projects_table
Revises: 001_add_oam_images
Create Date: 2026-03-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "002_add_map_projects_table"
down_revision = "001_add_oam_images"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "map_projects",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("product", sa.String(), nullable=False),
        sa.Column("project_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product", "project_id", name="uq_map_projects_product_project_id"),
    )
    op.create_index("idx_map_projects_product", "map_projects", ["product"], unique=False)
    op.create_index(
        "idx_map_projects_product_project_id",
        "map_projects",
        ["product", "project_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_map_projects_product_project_id", table_name="map_projects")
    op.drop_index("idx_map_projects_product", table_name="map_projects")
    op.drop_table("map_projects")

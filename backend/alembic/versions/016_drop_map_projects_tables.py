"""drop map_projects and map_project_sync_state tables

The homepage map feature (unified map aggregating project centroids from
tasking-manager, drone-tasking-manager, fair, imagery, umap and chatmap) was
removed. This drops the two tables it owned.

Revision ID: 016_drop_map_projects_tables
Revises: 015_plan_owned_collections
Create Date: 2026-09-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "016_drop_map_projects_tables"
down_revision = "015_plan_owned_collections"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_table("map_project_sync_state")
    op.drop_index("idx_map_projects_product_project_id", table_name="map_projects")
    op.drop_index("idx_map_projects_product", table_name="map_projects")
    op.drop_table("map_projects")


def downgrade() -> None:
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
    op.create_table(
        "map_project_sync_state",
        sa.Column("product", sa.String(), nullable=False),
        sa.Column("last_created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_identity", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("product"),
    )

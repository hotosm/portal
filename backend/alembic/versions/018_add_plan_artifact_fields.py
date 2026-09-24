"""add plan_project artifact fields

Adds a user-editable custom_title and S3-backed artifact metadata columns to
plan_projects, so a downloaded file (e.g. a SketchMap Tool PDF/GeoJSON) can be
fetched from an upstream once and served from storage after that, without
ever storing the file bytes themselves in Postgres.

Revision ID: 018_add_plan_artifact_fields
Revises: 017_add_portal_profiles
Create Date: 2026-09-21
"""

import sqlalchemy as sa

from alembic import op

revision = "018_add_plan_artifact_fields"
down_revision = "017_add_portal_profiles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("plan_projects", sa.Column("custom_title", sa.String(), nullable=True))
    op.add_column("plan_projects", sa.Column("artifact_s3_key", sa.String(), nullable=True))
    op.add_column(
        "plan_projects", sa.Column("artifact_content_type", sa.String(), nullable=True)
    )
    op.add_column(
        "plan_projects", sa.Column("artifact_size_bytes", sa.Integer(), nullable=True)
    )
    op.add_column(
        "plan_projects",
        sa.Column("artifact_fetched_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("plan_projects", "artifact_fetched_at")
    op.drop_column("plan_projects", "artifact_size_bytes")
    op.drop_column("plan_projects", "artifact_content_type")
    op.drop_column("plan_projects", "artifact_s3_key")
    op.drop_column("plan_projects", "custom_title")

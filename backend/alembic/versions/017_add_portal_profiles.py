"""add portal_profiles table

Portal-owned profile-page extras (bio, location, contact info, org/team
visibility toggles), keyed by hanko_user_id. Account identity fields (name,
picture, slug, is_public) continue to live in login and are never mirrored
here.

Revision ID: 017_add_portal_profiles
Revises: 016_drop_map_projects_tables
Create Date: 2026-09-17
"""

import sqlalchemy as sa

from alembic import op

revision = "017_add_portal_profiles"
down_revision = "016_drop_map_projects_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "portal_profiles",
        sa.Column("hanko_user_id", sa.String(length=36), primary_key=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.Column("contact_email", sa.String(length=254), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("linkedin_url", sa.String(length=500), nullable=True),
        sa.Column(
            "show_organizations", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column("show_teams", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("portal_profiles")

"""add portal_profiles.extra_links

Up to 4 extra contact links (https:// URLs) the owner adds next to email,
phone and LinkedIn. Stored as a JSONB list of strings; an empty list means
none.

Revision ID: 020_add_profile_extra_links
Revises: 019_add_former_project_id
Create Date: 2026-09-30
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "020_add_profile_extra_links"
down_revision = "019_add_former_project_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "portal_profiles",
        sa.Column(
            "extra_links",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )


def downgrade() -> None:
    op.drop_column("portal_profiles", "extra_links")

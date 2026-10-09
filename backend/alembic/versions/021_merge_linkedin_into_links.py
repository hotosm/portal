"""merge portal_profiles.linkedin_url into extra_links

LinkedIn stops being a field of its own: contact links are a free list. An
existing LinkedIn URL becomes the first extra link and the column goes away.
The list cap goes from 4 to 5 (app/models/profile.py) so nobody loses a link.

Revision ID: 021_merge_linkedin_into_links
Revises: 020_add_profile_extra_links
Create Date: 2026-10-08
"""

import sqlalchemy as sa

from alembic import op

revision = "021_merge_linkedin_into_links"
down_revision = "020_add_profile_extra_links"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE portal_profiles
        SET extra_links = jsonb_build_array(linkedin_url) || extra_links
        WHERE linkedin_url IS NOT NULL
          AND linkedin_url <> ''
          AND NOT extra_links @> jsonb_build_array(linkedin_url)
        """
    )
    op.drop_column("portal_profiles", "linkedin_url")


def downgrade() -> None:
    op.add_column("portal_profiles", sa.Column("linkedin_url", sa.String(500), nullable=True))
    # The first LinkedIn link goes back to its column and leaves the list.
    op.execute(
        r"""
        UPDATE portal_profiles p
        SET linkedin_url = s.url,
            extra_links = (
                SELECT COALESCE(jsonb_agg(e ORDER BY n), '[]'::jsonb)
                FROM jsonb_array_elements(p.extra_links) WITH ORDINALITY AS t(e, n)
                WHERE e <> to_jsonb(s.url)
            )
        FROM (
            SELECT hanko_user_id,
                   (
                       SELECT e #>> '{}'
                       FROM jsonb_array_elements(extra_links) WITH ORDINALITY AS t(e, n)
                       WHERE e #>> '{}' ~ '^https://([\w-]+\.)?linkedin\.com/'
                       ORDER BY n
                       LIMIT 1
                   ) AS url
            FROM portal_profiles
        ) s
        WHERE s.hanko_user_id = p.hanko_user_id
          AND s.url IS NOT NULL
        """
    )

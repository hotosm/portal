"""add plans.group_name

The name of the group a plan belongs to, as last seen from one of its members.
Login only reports a user's own groups, so without it a visitor outside the
group (or signed out) cannot be told who a public plan belongs to. Filled in on
create/update and whenever a member opens the plan; null until then.

Revision ID: 022_add_plan_group_name
Revises: 021_merge_linkedin_into_links
Create Date: 2026-10-08
"""

import sqlalchemy as sa

from alembic import op

revision = "022_add_plan_group_name"
down_revision = "021_merge_linkedin_into_links"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("plans", sa.Column("group_name", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("plans", "group_name")

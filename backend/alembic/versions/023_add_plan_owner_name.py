"""add plans.owner_name

The creator's username, kept on the plan so a visitor (or a signed-out user)
can be told who made a public plan that does not belong to a group. Filled in
on create and whenever the owner lists or opens their plans; null until then.

Revision ID: 023_add_plan_owner_name
Revises: 022_add_plan_group_name
Create Date: 2026-10-26
"""

import sqlalchemy as sa

from alembic import op

revision = "023_add_plan_owner_name"
down_revision = "022_add_plan_group_name"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("plans", sa.Column("owner_name", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("plans", "owner_name")

"""Add plan scope and visibility (teams/organizations).

Adds group scope (group_type/group_id), edit_scope, and a visibility enum that
replaces the is_public boolean. The is_public column is kept this release (its
server_default covers inserts the ORM no longer lists); dropping it is deferred
to a later migration to keep rollback cheap.

Revision ID: 013_add_plan_scope_visibility
Revises: 012_add_plan_project_featured
Create Date: 2026-07-20

"""

import sqlalchemy as sa
from alembic import op

revision = "013_add_plan_scope_visibility"
down_revision = "012_add_plan_project_featured"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add scope/visibility columns and backfill visibility from is_public."""
    op.add_column(
        "plans",
        sa.Column(
            "visibility",
            sa.String(),
            nullable=False,
            server_default="private",
        ),
    )
    op.add_column("plans", sa.Column("group_type", sa.String(), nullable=True))
    op.add_column("plans", sa.Column("group_id", sa.String(), nullable=True))
    op.add_column(
        "plans",
        sa.Column(
            "edit_scope", sa.String(), nullable=False, server_default="owner"
        ),
    )
    # Backfill: public plans keep public visibility; false stays private (default).
    op.execute("UPDATE plans SET visibility = 'public' WHERE is_public = true")
    op.create_index("ix_plans_group", "plans", ["group_type", "group_id"])


def downgrade() -> None:
    """Reverse the scope/visibility columns."""
    op.execute("UPDATE plans SET is_public = (visibility = 'public')")
    op.drop_index("ix_plans_group", table_name="plans")
    op.drop_column("plans", "edit_scope")
    op.drop_column("plans", "group_id")
    op.drop_column("plans", "group_type")
    op.drop_column("plans", "visibility")

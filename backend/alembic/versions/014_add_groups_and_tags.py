"""Add groups and tags: open-text taxonomies for plan projects/tasks.

Adds `groups` and `tags` tables (open-text labels owned per-user, optionally
shared with a login team/organization — same owner_id/group_type/group_id
scope as `plans`), plus `plan_project_groups`/`plan_project_tags` many-to-many
association tables linking them to `plan_projects`. Replaces the old fixed
Imagery/Mapping/Field/Data sections, which only ever existed as a frontend
constant — there is nothing to migrate on that side.

Revision ID: 014_add_groups_and_tags
Revises: 013_add_plan_scope_visibility
Create Date: 2026-08-06

"""

import sqlalchemy as sa
from alembic import op

revision = "014_add_groups_and_tags"
down_revision = "013_add_plan_scope_visibility"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create groups, tags, and their association tables to plan_projects."""
    op.create_table(
        "groups",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("group_type", sa.String(), nullable=True),
        sa.Column("group_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint(
            "owner_id", "group_type", "group_id", "name", name="uq_groups_scope_name"
        ),
    )
    op.create_index("ix_groups_owner_id", "groups", ["owner_id"])

    op.create_table(
        "tags",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("group_type", sa.String(), nullable=True),
        sa.Column("group_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint(
            "owner_id", "group_type", "group_id", "name", name="uq_tags_scope_name"
        ),
    )
    op.create_index("ix_tags_owner_id", "tags", ["owner_id"])

    op.create_table(
        "plan_project_groups",
        sa.Column(
            "plan_project_id",
            sa.String(),
            sa.ForeignKey("plan_projects.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "group_id",
            sa.String(),
            sa.ForeignKey("groups.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )

    op.create_table(
        "plan_project_tags",
        sa.Column(
            "plan_project_id",
            sa.String(),
            sa.ForeignKey("plan_projects.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "tag_id",
            sa.String(),
            sa.ForeignKey("tags.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )


def downgrade() -> None:
    """Reverse the groups/tags tables and their associations."""
    op.drop_table("plan_project_tags")
    op.drop_table("plan_project_groups")
    op.drop_index("ix_tags_owner_id", table_name="tags")
    op.drop_table("tags")
    op.drop_index("ix_groups_owner_id", table_name="groups")
    op.drop_table("groups")

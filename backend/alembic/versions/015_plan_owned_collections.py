"""Make collections belong to a plan and drop tags.

Replaces the user-owned `groups`/`tags` taxonomies (014) with `plan_collections`:
a collection now belongs to one plan, so every editor of a shared plan sees the
same collections, and a project belongs to at most one of them via the new
`plan_projects.collection_id` column instead of a many-to-many table.

Tags are dropped entirely; they will come back with their own design later.

Nothing is migrated: the feature only ever ran on dev.

Revision ID: 015_plan_owned_collections
Revises: 014_add_groups_and_tags
Create Date: 2026-08-14

"""

import sqlalchemy as sa
from alembic import op

revision = "015_plan_owned_collections"
down_revision = "014_add_groups_and_tags"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop the user-owned taxonomies and add plan-owned collections."""
    op.drop_table("plan_project_tags")
    op.drop_table("plan_project_groups")
    op.drop_index("ix_tags_owner_id", table_name="tags")
    op.drop_table("tags")
    op.drop_index("ix_groups_owner_id", table_name="groups")
    op.drop_table("groups")

    op.create_table(
        "plan_collections",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "plan_id",
            sa.String(),
            sa.ForeignKey("plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("plan_id", "name", name="uq_plan_collections_plan_name"),
    )
    op.create_index("ix_plan_collections_plan_id", "plan_collections", ["plan_id"])

    # Null means the project sits in the virtual "All" bucket. SET NULL so
    # deleting a collection drops its projects back there instead of deleting them.
    op.add_column(
        "plan_projects",
        sa.Column("collection_id", sa.String(), nullable=True),
    )
    op.create_foreign_key(
        "fk_plan_projects_collection_id",
        "plan_projects",
        "plan_collections",
        ["collection_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_plan_projects_collection_id", "plan_projects", ["collection_id"])


def downgrade() -> None:
    """Restore the 014 taxonomy tables (empty) and drop plan collections."""
    op.drop_index("ix_plan_projects_collection_id", table_name="plan_projects")
    op.drop_constraint("fk_plan_projects_collection_id", "plan_projects", type_="foreignkey")
    op.drop_column("plan_projects", "collection_id")
    op.drop_index("ix_plan_collections_plan_id", table_name="plan_collections")
    op.drop_table("plan_collections")

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

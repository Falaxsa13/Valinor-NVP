from alembic import op
import sqlalchemy as sa

# Migration identifiers
revision = "2a277c9a871a"
down_revision = "669d126fb0fa"


def upgrade():
    # Remove foreign keys
    op.drop_constraint("timeline_entries_section_id_fkey", "timeline_entries", type_="foreignkey")
    op.drop_constraint("timeline_entries_subtitle_id_fkey", "timeline_entries", type_="foreignkey")

    # Drop the old columns
    op.drop_column("timeline_entries", "section_id")
    op.drop_column("timeline_entries", "subtitle_id")

    # Add the new text columns
    op.add_column("timeline_entries", sa.Column("section", sa.String(), nullable=False))
    op.add_column("timeline_entries", sa.Column("subtitle", sa.String(), nullable=True))


def downgrade():
    # Revert changes if needed
    op.drop_column("timeline_entries", "section")
    op.drop_column("timeline_entries", "subtitle")

    op.add_column("timeline_entries", sa.Column("section_id", sa.Integer(), nullable=False))
    op.add_column("timeline_entries", sa.Column("subtitle_id", sa.Integer(), nullable=True))

    op.create_foreign_key(
        "timeline_entries_section_id_fkey", "timeline_entries", "template_sections", ["section_id"], ["id"]
    )
    op.create_foreign_key(
        "timeline_entries_subtitle_id_fkey", "timeline_entries", "template_subtitles", ["subtitle_id"], ["id"]
    )

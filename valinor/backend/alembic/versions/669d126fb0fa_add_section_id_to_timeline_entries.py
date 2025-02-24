from alembic import op
import sqlalchemy as sa

# Migration identifiers
revision = "669d126fb0fa"
down_revision = "3763df76f9da"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "timeline_entries", sa.Column("section_id", sa.Integer, sa.ForeignKey("template_sections.id"), nullable=True)
    )


def downgrade():
    op.drop_column("timeline_entries", "section_id")

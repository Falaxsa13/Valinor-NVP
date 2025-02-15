"""Add template_id column to projects

Revision ID: 2d277c9a871a
Revises: 
Create Date: 2025-02-15 16:57:58.813144

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "2d277c9a871a"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Step 1: Add template_id as nullable
    op.add_column("projects", sa.Column("template_id", sa.String(), nullable=True))

    # Step 2: Set a default value for existing rows (update manually)
    op.execute(
        "UPDATE projects SET template_id = 'default_template' WHERE template_id IS NULL"
    )

    # Step 3: Alter the column to be NOT NULL
    op.alter_column("projects", "template_id", nullable=False)


def downgrade():
    op.drop_column("projects", "template_id")

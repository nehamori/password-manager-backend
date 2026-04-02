"""add data types and fields tables

Revision ID: 1c2d3e4f5a6b
Revises: 0fb6ac11c1d2
Create Date: 2026-04-02 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1c2d3e4f5a6b"
down_revision: Union[str, Sequence[str], None] = "0fb6ac11c1d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "data_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_data_entries_user_id_users"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_data_entries")),
    )
    op.create_table(
        "data_entry_fields",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("data_type_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["data_type_id"],
            ["data_entries.id"],
            name=op.f("fk_data_entry_fields_data_type_id_data_entries"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_data_entry_fields")),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("data_entry_fields")
    op.drop_table("data_entries")

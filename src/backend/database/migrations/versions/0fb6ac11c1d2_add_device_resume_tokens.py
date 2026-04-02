"""add device resume tokens

Revision ID: 0fb6ac11c1d2
Revises: 13f4a7c8d9e0
Create Date: 2026-04-02 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0fb6ac11c1d2"
down_revision: Union[str, Sequence[str], None] = "13f4a7c8d9e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "user_device_resume_tokens",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_user_device_resume_tokens_user_id_users"),
        ),
        sa.PrimaryKeyConstraint("token", name=op.f("pk_user_device_resume_tokens")),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("user_device_resume_tokens")

"""add user profile fields

Revision ID: 13f4a7c8d9e0
Revises: f3e1b6a9c2d4
Create Date: 2026-03-16 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "13f4a7c8d9e0"
down_revision: Union[str, Sequence[str], None] = "f3e1b6a9c2d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("nickname", sa.String(), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))
    op.execute("UPDATE users SET nickname = 'user-' || id::text WHERE nickname IS NULL")
    op.alter_column("users", "nickname", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "nickname")

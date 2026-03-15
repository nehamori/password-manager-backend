"""make login token primary key

Revision ID: f3e1b6a9c2d4
Revises: 8c8112305081
Create Date: 2026-03-15 16:58:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "f3e1b6a9c2d4"
down_revision: Union[str, Sequence[str], None] = "8c8112305081"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint("pk_user_login_tokens", "user_login_tokens", type_="primary")
    op.create_primary_key("pk_user_login_tokens", "user_login_tokens", ["token"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("pk_user_login_tokens", "user_login_tokens", type_="primary")
    op.create_primary_key("pk_user_login_tokens", "user_login_tokens", ["user_id"])

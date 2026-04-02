"""fix field type enum for data entry fields

Revision ID: 2a7f9b3c4d5e
Revises: 1c2d3e4f5a6b
Create Date: 2026-04-02 13:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "2a7f9b3c4d5e"
down_revision: Union[str, Sequence[str], None] = "1c2d3e4f5a6b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


FIELD_TYPE_ENUM_NAME = "fieldtypeenum"
FIELD_TYPE_VALUES = ("TEXT", "PASSWORD", "EMAIL", "TOTP", "NOTES")


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fieldtypeenum') THEN
                CREATE TYPE fieldtypeenum AS ENUM ('TEXT', 'PASSWORD', 'EMAIL', 'TOTP', 'NOTES');
            END IF;
        END
        $$;
        """
    )

    op.alter_column(
        "data_entry_fields",
        "type",
        existing_type=sa.String(),
        type_=postgresql.ENUM(
            *FIELD_TYPE_VALUES, name=FIELD_TYPE_ENUM_NAME, create_type=False
        ),
        postgresql_using='"type"::fieldtypeenum',
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "data_entry_fields",
        "type",
        existing_type=postgresql.ENUM(
            *FIELD_TYPE_VALUES, name=FIELD_TYPE_ENUM_NAME, create_type=False
        ),
        type_=sa.String(),
        postgresql_using='"type"::text',
        existing_nullable=False,
    )

    op.execute("DROP TYPE IF EXISTS fieldtypeenum")

from datetime import datetime
from typing import Annotated
from sqlalchemy import JSON, DateTime, MetaData, String
from sqlalchemy.orm import DeclarativeBase, registry
from sqlalchemy.ext.asyncio import AsyncAttrs


json = Annotated[dict, "json"]
str_32 = Annotated[str, 32]
str_64 = Annotated[str, 64]
str_129 = Annotated[str, 129]
datetime_tz = Annotated[datetime, True]

registry_data = registry(
    type_annotation_map={
        json: JSON,
        str_32: String(32),
        str_64: String(64),
        str_129: String(129),
        datetime_tz: DateTime(timezone=True),
    }
)

naming_convention_data = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class BaseSqlModel(AsyncAttrs, DeclarativeBase):
    registry = registry_data
    metadata = MetaData(naming_convention=naming_convention_data)

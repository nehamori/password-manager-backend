from enum import StrEnum

from database.orm import BaseSqlModel
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, ForeignKey, Integer

from ..orm import datetime_tz
from .. import models


class FieldTypeEnum(StrEnum):
    TEXT = "TEXT"
    PASSWORD = "PASSWORD"
    EMAIL = "EMAIL"
    TOTP = "TOTP"
    NOTES = "NOTES"


class DataTypeOrm(BaseSqlModel):
    __tablename__ = "data_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str]

    user: Mapped["models.UserOrm"] = relationship("UserOrm", lazy="selectin")
    fields: Mapped[list["models.DataTypeFieldOrm"]] = relationship(
        "DataTypeFieldOrm", back_populates="data_type", lazy="selectin"
    )


class DataTypeFieldOrm(BaseSqlModel):
    __tablename__ = "data_entry_fields"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    data_type_id: Mapped[int] = mapped_column(ForeignKey("data_entries.id"))
    name: Mapped[str]
    type: Mapped[FieldTypeEnum]

    data_type: Mapped["models.DataTypeOrm"] = relationship(
        "DataTypeOrm", back_populates="fields", lazy="selectin"
    )

from database.orm import BaseSqlModel
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, ForeignKey, Integer

from .. import models


class UserOrm(BaseSqlModel):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)


class EmailUserOrm(BaseSqlModel):
    __tablename__ = "email_users"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str]

    user: Mapped["models.UserOrm"] = relationship("UserOrm")


class TelegramUserOrm(BaseSqlModel):
    __tablename__ = "telegram_users"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    telegram_username: Mapped[str] = mapped_column(unique=True)
    telegram_full_name: Mapped[str]

    user: Mapped["models.UserOrm"] = relationship("UserOrm")


class DiscordUserOrm(BaseSqlModel):
    __tablename__ = "discord_users"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    discord_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    discord_username: Mapped[str] = mapped_column(unique=True)

    user: Mapped["models.UserOrm"] = relationship("UserOrm")

from database.orm import BaseSqlModel
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String


class UserOrm(BaseSqlModel):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(128), nullable=False)

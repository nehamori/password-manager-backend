from typing import Any, Sequence

from database.connection import DatabaseConnection

from .users import UsersDAO
from .data import DataDAO


class DAO(UsersDAO, DataDAO):
    def __init__(self, db_connection: DatabaseConnection):
        self.session = db_connection.session()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, *_):
        if exc_type is None:
            await self.session.commit()
        else:
            await self.session.rollback()

        await self.session.close()

    def add(self, instance: Any):
        self.session.add(instance)

    def add_all(self, instances: Any):
        self.session.add_all(instances)

    async def flush(self, instances: Sequence[Any] | None):
        await self.session.flush(instances)

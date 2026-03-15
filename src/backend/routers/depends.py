from typing import AsyncGenerator

from fastapi import Request
from database import DatabaseConnection, DAO


async def get_db_dao(request: Request) -> AsyncGenerator[DAO, None]:
    db_connection: DatabaseConnection = request.app.state.db_connection
    async with DAO(db_connection) as dao:
        yield dao

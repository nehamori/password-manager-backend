from typing import AsyncGenerator

from fastapi import Depends, HTTPException, Request
from utils.jwt_manager import JWTError, JWTManager
from database import DatabaseConnection, DAO, UserOrm


async def get_db_dao(request: Request) -> AsyncGenerator[DAO, None]:
    db_connection: DatabaseConnection = request.app.state.db_connection
    async with DAO(db_connection) as dao:
        yield dao


async def get_user(request: Request, dao: DAO = Depends(get_db_dao)) -> UserOrm:
    jwt: JWTManager = request.app.state.jwt

    auth_token = request.cookies.get("auth_token")
    if not auth_token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        payload = jwt.decode_token(auth_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id_str = payload.get("sub")
    if not user_id_str or not user_id_str.isdigit():
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = int(user_id_str)
    user = await dao.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user

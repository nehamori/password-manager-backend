from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import DatabaseConnection


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_connection = DatabaseConnection("memory://")

    app.state.db_connection = db_connection

    yield

    await db_connection.close()


def app():
    return FastAPI()

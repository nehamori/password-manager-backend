from contextlib import asynccontextmanager

from fastapi import FastAPI

from settings import Settings

from .database import DatabaseConnection


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = Settings()

    db_connection = DatabaseConnection(settings.DATABASE_URL)

    app.state.db_connection = db_connection

    yield

    await db_connection.close()


def app():
    return FastAPI()

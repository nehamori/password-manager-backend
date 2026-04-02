from contextlib import asynccontextmanager

from aiogram import Bot
from fastapi import FastAPI

from settings import Settings

from database import DatabaseConnection
from routers import auth_router, data_router
from utils import DiscordCodeManager, Cryptography, JWTManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = Settings()

    db_connection = DatabaseConnection(settings.DATABASE_URL)
    telegram_bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    telegram_bot_user = await telegram_bot.me()
    await telegram_bot.session.close()

    discord_code_manager = DiscordCodeManager(
        settings.DISCORD_APP_ID, settings.DISCORD_SECRET_TOKEN
    )

    app.state.discord_code_manager = discord_code_manager
    app.state.crypto = Cryptography()
    app.state.jwt = JWTManager(settings.SECRET_KEY)
    app.state.db_connection = db_connection
    app.state.telegram_bot_user = telegram_bot_user
    app.state.settings = settings

    yield

    await discord_code_manager.close()
    await db_connection.close()


def app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)

    app.include_router(auth_router)
    app.include_router(data_router)

    return app

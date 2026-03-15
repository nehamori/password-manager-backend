from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    DATABASE_URL: str
    TELEGRAM_BOT_TOKEN: str
    SECRET_KEY: str
    DISCORD_APP_ID: str
    DISCORD_SECRET_TOKEN: str

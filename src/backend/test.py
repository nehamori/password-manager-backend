import asyncio

from utils.discord import DiscordCodeManager
from settings import Settings


async def main():
    settings = Settings()
    manager = DiscordCodeManager(settings.DISCORD_APP_ID, settings.DISCORD_SECRET_TOKEN)
    print(
        await manager.get_info_and_revoke(
            "EthSGdSrxs3XlWUkqD1zedNLeBnRIH",
            "https://acerb-nonmicroscopic-abraham.ngrok-free.dev/login/discord",
        )
    )
    await manager.close()


asyncio.run(main())

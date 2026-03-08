from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker


class DatabaseConnection:
    def __init__(self, url: str):
        self._engine = create_async_engine(url, echo=True)
        self._sessionmaker = async_sessionmaker(self._engine)

    def session(self):
        return self._sessionmaker()

    async def close(self):
        await self._engine.dispose()

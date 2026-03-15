import aiohttp
from pydantic import BaseModel

from settings import Settings


class AuthorizationCodeData(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
    scope: str


class UserInfo(BaseModel):
    id: int
    username: str
    avatar: str
    email: str

    @property
    def avatar_url(self) -> str:
        ext = "gif" if self.avatar.startswith("a_") else "png"
        return f"https://cdn.discordapp.com/avatars/{self.id}/{self.avatar}.{ext}"


class DiscordCodeManager:
    def __init__(self, discord_app_id: str, discord_secret_token: str):
        self._auth_data = aiohttp.BasicAuth(discord_app_id, discord_secret_token)
        self._session = aiohttp.ClientSession(base_url="https://discord.com/api/v10/")
        self._base_headers = {"Content-Type": "application/x-www-form-urlencoded"}

    async def close(self):
        await self._session.close()

    async def code_to_tokens(
        self, code: str, redirect_uri: str
    ) -> AuthorizationCodeData:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }

        r = await self._session.post(
            "oauth2/token",
            data=data,
            headers=self._base_headers,
            auth=self._auth_data,
        )
        if r.status != 200:
            raise ValueError(f"Failed to get access token: {r.status}")

        return AuthorizationCodeData.model_validate_json(await r.text())

    async def revoke_token(self, access_token: str):
        data = {"token": access_token, "token_type_hint": "access_token"}

        r = await self._session.post(
            "oauth2/token/revoke",
            data=data,
            headers=self._base_headers,
            auth=self._auth_data,
        )
        if r.status != 200:
            raise ValueError(f"Failed to revoke token: {r.status}")

    async def get_user_info(self, access_token: str) -> UserInfo:
        r = await self._session.get(
            "users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if r.status != 200:
            raise ValueError(f"Failed to get user info: {r.status}")

        return UserInfo.model_validate_json(await r.text())

    async def get_info_and_revoke(self, code: str, redirect_uri: str) -> UserInfo:
        tokens = await self.code_to_tokens(code, redirect_uri)
        user_info = await self.get_user_info(tokens.access_token)
        await self.revoke_token(tokens.access_token)
        return user_info

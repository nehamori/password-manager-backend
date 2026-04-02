from aiogram.utils.web_app import WebAppUser as TelegramUser
from datetime import datetime
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from utils.discord import UserInfo

from database.models import (
    TelegramUserOrm,
    DiscordUserOrm,
    UserOrm,
    UserLoginTokenOrm,
    UserDeviceResumeTokenOrm,
)


class UsersDAO:
    session: AsyncSession

    async def get_user_by_discord(
        self,
        discord_data: UserInfo,
        *,
        random_salt: str,
        assign_to_user_id: int | None = None,
    ) -> UserOrm:
        discord_user_result = await self.session.execute(
            select(DiscordUserOrm).where(DiscordUserOrm.discord_id == discord_data.id)
        )
        discord_user = discord_user_result.scalar()
        if not discord_user:
            if assign_to_user_id is None:
                user_orm = UserOrm(
                    account_verified=True,
                    salt=random_salt,
                    nickname=discord_data.username,
                    avatar_url=discord_data.avatar_url,
                )
                self.session.add(user_orm)
                await self.session.flush([user_orm])
                assign_to_user_id = user_orm.id

            discord_user = DiscordUserOrm(
                user_id=assign_to_user_id,
                discord_id=discord_data.id,
                discord_username=discord_data.username,
            )
            self.session.add(discord_user)
            await self.session.flush([discord_user])

        return discord_user.user

    async def get_user_by_telegram(
        self,
        user: TelegramUser,
        *,
        random_salt: str,
        assign_to_user_id: int | None = None,
    ) -> UserOrm:
        telegram_user_result = await self.session.execute(
            select(TelegramUserOrm).where(TelegramUserOrm.telegram_id == user.id)
        )
        telegram_user = telegram_user_result.scalar()
        if not telegram_user:
            if assign_to_user_id is None:
                telegram_full_name = f"{user.first_name} {user.last_name or ''}".strip()
                user_orm = UserOrm(
                    account_verified=True,
                    salt=random_salt,
                    nickname=user.username or telegram_full_name,
                    avatar_url=user.photo_url,
                )
                self.session.add(user_orm)
                await self.session.flush([user_orm])
                assign_to_user_id = user_orm.id

            telegram_user = TelegramUserOrm(
                user_id=assign_to_user_id,
                telegram_id=user.id,
                telegram_username=user.username,
                telegram_full_name=f"{user.first_name} {user.last_name or ''}".strip(),
            )
            self.session.add(telegram_user)
            await self.session.flush([telegram_user])

        return telegram_user.user

    async def get_user_by_id(self, user_id: int) -> UserOrm | None:
        result = await self.session.execute(
            select(UserOrm).where(UserOrm.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_login_token(self, token: str) -> UserLoginTokenOrm | None:
        result = await self.session.execute(
            select(UserLoginTokenOrm).where(UserLoginTokenOrm.token == token)
        )
        return result.scalar_one_or_none()

    async def delete_login_token(self, token: str) -> None:
        await self.session.execute(
            delete(UserLoginTokenOrm).where(UserLoginTokenOrm.token == token)
        )

    async def create_device_resume_token(
        self, user_id: int, token: str, expires_at: datetime
    ) -> UserDeviceResumeTokenOrm:
        resume_token = UserDeviceResumeTokenOrm(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        self.session.add(resume_token)
        await self.session.flush([resume_token])
        return resume_token

    async def get_device_resume_token(
        self, token: str
    ) -> UserDeviceResumeTokenOrm | None:
        result = await self.session.execute(
            select(UserDeviceResumeTokenOrm).where(
                UserDeviceResumeTokenOrm.token == token
            )
        )
        return result.scalar_one_or_none()

    async def delete_device_resume_token(self, token: str) -> None:
        await self.session.execute(
            delete(UserDeviceResumeTokenOrm).where(
                UserDeviceResumeTokenOrm.token == token
            )
        )

    async def delete_expired_device_resume_tokens(self, now: datetime) -> None:
        await self.session.execute(
            delete(UserDeviceResumeTokenOrm).where(
                UserDeviceResumeTokenOrm.expires_at < now
            )
        )

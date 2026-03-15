from datetime import datetime, timezone

from aiogram.types import User as BotUser
from aiogram.utils.auth_widget import check_integrity
from aiogram.utils.web_app import WebAppUser as TelegramUser
from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import ValidationError

from database import DAO, UserOrm, UserLoginTokenOrm
from routers.depends import get_db_dao
from settings import Settings
from utils import DiscordCodeManager, Cryptography

from .models import (
    DiscordLoginDataResponse,
    DiscordLoginRequest,
    LoginChallenge,
    LoginCompleteRequest,
    LoginResponse,
    TelegramLoginDataResponse,
    TelegramLoginRequest,
    User,
)


auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register/email")
async def register_email():
    raise NotImplementedError


@auth_router.get("/login/telegram/login_data")
async def login_telegram_login_data(request: Request):
    telegram_bot_user: BotUser = request.app.state.telegram_bot_user
    if not telegram_bot_user.username:
        raise ValueError("Telegram bot must have a username")

    return TelegramLoginDataResponse(telegram_bot_name=telegram_bot_user.username)


@auth_router.get("/login/discord/login_data")
async def login_discord_login_data(request: Request):
    settings: Settings = request.app.state.settings

    return DiscordLoginDataResponse(client_id=settings.DISCORD_APP_ID)


async def login_return_challenge(
    user: UserOrm, dao: DAO, crypto: Cryptography
) -> LoginResponse:
    login_token = crypto.generate_login_token(user.id)
    login_token_orm = UserLoginTokenOrm(
        user_id=login_token.user_id,
        token=login_token.token,
        challenge=login_token.challenge,
        expires_at=login_token.expires_at,
    )
    dao.add(login_token_orm)
    await dao.flush([login_token_orm])

    return LoginResponse(
        user=User(id=user.id),
        login_challenge=LoginChallenge(salt=user.salt, challenge=login_token.challenge),
        login_token=login_token.token,
        is_new_user=not user.verifier,
    )


@auth_router.post("/login/telegram")
async def login_telegram(
    body: TelegramLoginRequest, request: Request, dao: DAO = Depends(get_db_dao)
):
    settings: Settings = request.app.state.settings
    crypto: Cryptography = request.app.state.crypto

    if not check_integrity(settings.TELEGRAM_BOT_TOKEN, body.telegram_data):
        raise HTTPException(status_code=400, detail="Invalid Telegram login data")

    try:
        tg_user = TelegramUser.model_validate(body.telegram_data)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid Telegram user data")

    random_salt = crypto.generate_hash()
    user = await dao.get_user_by_telegram(tg_user, random_salt=random_salt)
    return await login_return_challenge(user, dao, crypto)


@auth_router.post("/login/discord")
async def login_discord(
    body: DiscordLoginRequest, request: Request, dao: DAO = Depends(get_db_dao)
):
    discord_code_manager: DiscordCodeManager = request.app.state.discord_code_manager
    crypto: Cryptography = request.app.state.crypto

    discord_user = await discord_code_manager.get_info_and_revoke(
        body.code, body.redirect_uri
    )

    random_salt = crypto.generate_hash()
    user = await dao.get_user_by_discord(discord_user, random_salt=random_salt)
    return await login_return_challenge(user, dao, crypto)


@auth_router.post("/login/complete")
async def login_complete(
    body: LoginCompleteRequest, request: Request, dao: DAO = Depends(get_db_dao)
):
    crypto: Cryptography = request.app.state.crypto

    login_token_result = await dao.get_login_token(body.login_token)
    now = datetime.now(tz=timezone.utc)
    if not login_token_result or login_token_result.expires_at < now:
        raise HTTPException(status_code=400, detail="Invalid or expired login token")

    user = await dao.get_user_by_id(login_token_result.user_id)
    if not user:
        raise HTTPException(status_code=500, detail="Internal error")

    if not user.verifier:
        if not body.verifier:
            raise HTTPException(
                status_code=400, detail="Verifier is required for new users"
            )

        user.verifier = body.verifier
        await dao.flush([user])

    else:
        if not body.challenge_proof:
            raise HTTPException(
                status_code=400, detail="Challenge proof is required for existing users"
            )

        if not crypto.verify_challenge_response(
            user.verifier, login_token_result.challenge, body.challenge_proof
        ):
            raise HTTPException(status_code=400, detail="Invalid challenge proof")

    await dao.delete_login_token(login_token_result.token)

    return {"ok": True}

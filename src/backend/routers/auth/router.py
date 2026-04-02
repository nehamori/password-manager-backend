from datetime import datetime, timedelta, timezone

from aiogram.types import User as BotUser
from aiogram.utils.auth_widget import check_integrity
from aiogram.utils.web_app import WebAppUser as TelegramUser
from fastapi import APIRouter, Depends, Request, HTTPException, Response
from pydantic import ValidationError

from database import DAO, UserOrm, UserLoginTokenOrm
from routers.depends import get_db_dao, get_user
from settings import Settings
from utils import DiscordCodeManager, Cryptography, JWTManager

from .models import (
    DiscordLoginDataResponse,
    DiscordLoginRequest,
    LoginChallenge,
    LoginCompleteRequest,
    LoginCompleteResponse,
    LoginResponse,
    TelegramLoginDataResponse,
    TelegramLoginRequest,
    User,
)


auth_router = APIRouter(prefix="/auth", tags=["auth"])

AUTH_COOKIE_NAME = "auth_token"
DEVICE_RESUME_COOKIE_NAME = "device_resume_token"
DEVICE_RESUME_EXPIRATION = timedelta(days=30)


@auth_router.get("/me")
async def me(user: UserOrm = Depends(get_user)) -> User:
    return User(id=user.id, username=user.nickname, avatar_url=user.avatar_url)


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
        user=User(id=user.id, username=user.nickname, avatar_url=user.avatar_url),
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


@auth_router.post("/login/resume")
async def login_resume(
    request: Request, dao: DAO = Depends(get_db_dao)
) -> LoginResponse:
    crypto: Cryptography = request.app.state.crypto

    resume_token = request.cookies.get(DEVICE_RESUME_COOKIE_NAME)
    if not resume_token:
        raise HTTPException(status_code=401, detail="Trusted device session not found")

    now = datetime.now(tz=timezone.utc)
    await dao.delete_expired_device_resume_tokens(now)

    resume_token_result = await dao.get_device_resume_token(resume_token)
    if not resume_token_result:
        raise HTTPException(status_code=401, detail="Trusted device session not found")

    if resume_token_result.expires_at < now:
        await dao.delete_device_resume_token(resume_token_result.token)
        raise HTTPException(status_code=401, detail="Trusted device session expired")

    user = await dao.get_user_by_id(resume_token_result.user_id)
    if not user:
        await dao.delete_device_resume_token(resume_token_result.token)
        raise HTTPException(status_code=401, detail="Trusted device session not found")

    return await login_return_challenge(user, dao, crypto)


@auth_router.post("/login/complete", response_model=LoginCompleteResponse)
async def login_complete(
    body: LoginCompleteRequest,
    request: Request,
    response: Response,
    dao: DAO = Depends(get_db_dao),
):
    crypto: Cryptography = request.app.state.crypto
    jwt: JWTManager = request.app.state.jwt

    login_token_result = await dao.get_login_token(body.login_token)
    now = datetime.now(tz=timezone.utc)
    if not login_token_result:
        raise HTTPException(status_code=400, detail="Invalid or expired login token")

    if login_token_result.expires_at < now:
        await dao.delete_login_token(login_token_result.token)
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

    now = datetime.now(tz=timezone.utc)
    resume_token = crypto.generate_hash()
    resume_expires_at = now + DEVICE_RESUME_EXPIRATION
    await dao.create_device_resume_token(user.id, resume_token, resume_expires_at)

    jwt_token = jwt.create_token(user.id)
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        secure=request.url.scheme == "https",
        samesite="lax",
        max_age=int(jwt.default_expiration.total_seconds()),
        path="/",
    )
    response.set_cookie(
        key=DEVICE_RESUME_COOKIE_NAME,
        value=resume_token,
        httponly=True,
        secure=request.url.scheme == "https",
        samesite="lax",
        max_age=int(DEVICE_RESUME_EXPIRATION.total_seconds()),
        path="/",
    )

    return LoginCompleteResponse(
        user=User(id=user.id, username=user.nickname, avatar_url=user.avatar_url)
    )

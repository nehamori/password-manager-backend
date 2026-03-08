from fastapi import APIRouter


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register/email")
async def register_email():
    raise NotImplementedError


@router.post("/register/telegram")
async def register_telegram():
    raise NotImplementedError


@router.post("/register/discord")
async def register_discord():
    raise NotImplementedError

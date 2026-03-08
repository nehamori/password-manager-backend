from fastapi import APIRouter


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register():
    raise NotImplementedError


@router.post("/login")
async def login():
    raise NotImplementedError

from pydantic import BaseModel, ConfigDict, Field


class TelegramLoginDataResponse(BaseModel):
    telegram_bot_name: str = Field(serialization_alias="telegramBotName")

    model_config = ConfigDict(populate_by_name=True)


class TelegramLoginRequest(BaseModel):
    telegram_data: dict = Field(alias="telegramData")

    model_config = ConfigDict(populate_by_name=True)


class DiscordLoginDataResponse(BaseModel):
    client_id: str = Field(serialization_alias="clientId")

    model_config = ConfigDict(populate_by_name=True)


class DiscordLoginRequest(BaseModel):
    code: str
    redirect_uri: str = Field(alias="redirectUri")

    model_config = ConfigDict(populate_by_name=True)


class User(BaseModel):
    id: int


class LoginChallenge(BaseModel):
    salt: str
    challenge: str


class LoginResponse(BaseModel):
    user: User
    login_challenge: LoginChallenge = Field(serialization_alias="loginChallenge")
    login_token: str = Field(serialization_alias="loginToken")
    is_new_user: bool = Field(serialization_alias="isNewUser")

    model_config = ConfigDict(serialize_by_alias=True, validate_by_alias=False)


class LoginCompleteRequest(BaseModel):
    login_token: str = Field(alias="loginToken")
    challenge_proof: str | None = Field(alias="challengeProof", default=None)
    verifier: str | None = None

    model_config = ConfigDict(populate_by_name=True)

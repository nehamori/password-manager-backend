from datetime import datetime, timedelta, timezone
from typing import Any

from jwt import InvalidTokenError, decode, encode


class JWTError(ValueError):
    pass


class JWTManager:
    def __init__(
        self,
        secret_key: str,
        *,
        algorithm: str = "HS256",
        default_expiration: timedelta = timedelta(hours=1),
    ):
        self._secret_key = secret_key
        self._algorithm = algorithm
        self._default_expiration = default_expiration

    @property
    def default_expiration(self) -> timedelta:
        return self._default_expiration

    def create_token(
        self,
        user_id: int,
        *,
        expires_in: timedelta | None = None,
        extra_claims: dict[str, Any] | None = None,
    ) -> str:
        now = datetime.now(tz=timezone.utc)
        expiration = now + (expires_in or self._default_expiration)

        payload: dict[str, Any] = {
            "sub": str(user_id),
            "iat": now,
            "exp": expiration,
        }
        if extra_claims:
            payload.update(extra_claims)

        return encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode_token(self, token: str) -> dict[str, Any]:
        try:
            decoded = decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
            )
        except InvalidTokenError as exc:
            raise JWTError("Invalid or expired JWT token") from exc

        if not isinstance(decoded, dict):
            raise JWTError("Invalid JWT payload")

        return decoded

    def get_user_id(self, token: str) -> int:
        payload = self.decode_token(token)
        raw_sub = payload.get("sub")
        if raw_sub is None:
            raise JWTError("JWT token does not contain subject")

        try:
            return int(raw_sub)
        except (TypeError, ValueError) as exc:
            raise JWTError("JWT subject is not a valid user id") from exc

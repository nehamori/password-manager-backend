from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hmac
import secrets


@dataclass(frozen=True, kw_only=True)
class UserLoginToken:
    user_id: int
    token: str
    challenge: str
    expires_at: datetime


class Cryptography:
    def generate_login_token(self, user_id: int) -> UserLoginToken:
        return UserLoginToken(
            user_id=user_id,
            token=secrets.token_urlsafe(32),
            challenge=secrets.token_hex(32),
            expires_at=datetime.now(tz=timezone.utc) + timedelta(minutes=5),
        )

    def verify_challenge_response(
        self, verifier: str, challenge: str, proof: str
    ) -> bool:
        expected = hmac.new(
            verifier.encode(), bytes.fromhex(challenge), "sha256"
        ).digest()
        return hmac.compare_digest(expected, bytes.fromhex(proof))

    def generate_hash(self) -> str:
        return secrets.token_urlsafe(32)

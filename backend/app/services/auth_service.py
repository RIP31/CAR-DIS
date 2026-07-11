from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token, UserCreate, UserLogin

class AuthService:
    def __init__(self, db: Session) -> None:
        self.repository = UserRepository(db)

    def register_user(self, payload: UserCreate) -> User:
        if self.repository.get_user_by_email(payload.email):
            raise ValueError("Email already exists")

        return self.repository.create_user(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )

    def authenticate_user(self, email: str, password: str) -> User | None:
        user = self.repository.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def login_user(self, payload: UserLogin) -> Token:
        user = self.authenticate_user(payload.email, payload.password)
        if not user:
            raise ValueError("Invalid email or password")

        token = create_access_token(subject=user.id, role=user.role)
        return Token(access_token=token)

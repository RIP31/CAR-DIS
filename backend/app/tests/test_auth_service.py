import pytest
from sqlalchemy.orm import Session
from app.models.user import UserRole
from app.schemas.auth import UserCreate, UserLogin
from app.services.auth_service import AuthService

def test_auth_service_register_user(db_session: Session):
    service = AuthService(db_session)
    payload = UserCreate(
        name="Alice Admin",
        email="alice@example.com",
        password="Password123!",
        role=UserRole.ADMIN
    )
    user = service.register_user(payload)

    assert user.id is not None
    assert user.name == "Alice Admin"
    assert user.email == "alice@example.com"
    assert user.role == UserRole.ADMIN
    assert user.hashed_password != "Password123!"  # Must be hashed

def test_auth_service_register_duplicate_email(db_session: Session):
    service = AuthService(db_session)
    payload = UserCreate(
        name="Alice Admin",
        email="alice@example.com",
        password="Password123!",
        role=UserRole.ADMIN
    )
    service.register_user(payload)

    # Re-registering same email should fail
    with pytest.raises(ValueError) as exc_info:
        service.register_user(payload)
    assert str(exc_info.value) == "Email already exists"

def test_auth_service_authenticate_user(db_session: Session):
    service = AuthService(db_session)
    payload = UserCreate(
        name="User test",
        email="usertest@example.com",
        password="Password123!",
        role=UserRole.USER
    )
    service.register_user(payload)

    # Valid credentials
    user = service.authenticate_user("usertest@example.com", "Password123!")
    assert user is not None
    assert user.name == "User test"

    # Invalid password
    user_wrong_pass = service.authenticate_user("usertest@example.com", "WrongPassword!")
    assert user_wrong_pass is None

    # Non-existent user
    user_not_exist = service.authenticate_user("missing@example.com", "Password123!")
    assert user_not_exist is None

def test_auth_service_login_user(db_session: Session):
    service = AuthService(db_session)
    payload_register = UserCreate(
        name="User test",
        email="usertest@example.com",
        password="Password123!",
        role=UserRole.USER
    )
    service.register_user(payload_register)

    # Successful login
    payload_login = UserLogin(email="usertest@example.com", password="Password123!")
    token_response = service.login_user(payload_login)
    assert token_response.access_token is not None
    assert token_response.token_type == "bearer"

    # Failed login
    payload_login_bad = UserLogin(email="usertest@example.com", password="WrongPassword!")
    with pytest.raises(ValueError) as exc_info:
        service.login_user(payload_login_bad)
    assert str(exc_info.value) == "Invalid email or password"

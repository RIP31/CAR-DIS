from sqlalchemy.orm import Session
from app.models.user import UserRole
from app.repositories.user_repository import UserRepository

def test_user_repository_create(db_session: Session):
    repo = UserRepository(db_session)
    user = repo.create_user(
        name="John Doe",
        email="john@example.com",
        hashed_password="hashed_password_123",
        role=UserRole.USER
    )

    assert user.id is not None
    assert user.name == "John Doe"
    assert user.email == "john@example.com"
    assert user.hashed_password == "hashed_password_123"
    assert user.role == UserRole.USER

def test_user_repository_get_by_email(db_session: Session):
    repo = UserRepository(db_session)
    repo.create_user(
        name="Jane Doe",
        email="jane@example.com",
        hashed_password="hashed_password_456",
        role=UserRole.ADMIN
    )

    found = repo.get_user_by_email("jane@example.com")
    assert found is not None
    assert found.name == "Jane Doe"
    assert found.role == UserRole.ADMIN

    not_found = repo.get_user_by_email("missing@example.com")
    assert not_found is None

def test_user_repository_get_by_id(db_session: Session):
    repo = UserRepository(db_session)
    created = repo.create_user(
        name="Bob Smith",
        email="bob@example.com",
        hashed_password="hashed_password_789",
        role=UserRole.USER
    )

    found = repo.get_user_by_id(created.id)
    assert found is not None
    assert found.email == "bob@example.com"

    not_found = repo.get_user_by_id("non-existent-uuid")
    assert not_found is None

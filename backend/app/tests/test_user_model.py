from sqlalchemy.orm import Session
from app.models.user import User, UserRole

def test_create_user_model(db_session: Session):
    user = User(
        name="Test User",
        email="test@example.com",
        hashed_password="hashed_password_123",
        role=UserRole.USER
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.name == "Test User"
    assert user.email == "test@example.com"
    assert user.role == UserRole.USER
    assert user.created_at is not None
    assert user.updated_at is not None

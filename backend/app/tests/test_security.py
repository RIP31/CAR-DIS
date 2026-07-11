from datetime import timedelta
import pytest
from fastapi import HTTPException
from app.models.user import UserRole
from app.core.security import hash_password, verify_password, create_access_token, verify_access_token

def test_password_hashing():
    password = "MySecurePassword123!"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False

def test_jwt_token_flow():
    subject = "user-uuid-1234"
    role = UserRole.USER
    
    token = create_access_token(subject=subject, role=role)
    assert token is not None
    
    payload = verify_access_token(token)
    assert payload.sub == subject
    assert payload.role == role
    assert payload.exp is not None

def test_jwt_token_expiry():
    subject = "user-uuid-1234"
    role = UserRole.USER
    
    # Token that expired 5 minutes ago
    token = create_access_token(subject=subject, role=role, expires_delta=timedelta(minutes=-5))
    
    with pytest.raises(HTTPException) as exc_info:
        verify_access_token(token)
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid or expired token"

def test_jwt_token_invalid():
    with pytest.raises(HTTPException) as exc_info:
        verify_access_token("completely-invalid-token-string")
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid or expired token"

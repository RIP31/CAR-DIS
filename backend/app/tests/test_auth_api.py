from fastapi.testclient import TestClient

def test_api_register_user(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "Password123!",
            "role": "USER",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "john@example.com"
    assert body["role"] == "USER"
    assert "hashed_password" not in body
    assert "id" in body

def test_api_duplicate_email_returns_error(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "Password123!",
            "role": "USER",
        },
    )

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Two",
            "email": "jane@example.com",
            "password": "Password123!",
            "role": "USER",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already exists"

def test_api_login_returns_jwt_token(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "Password123!",
            "role": "USER",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "Password123!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]

def test_api_login_with_invalid_credentials_returns_error(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": "missing@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

def test_api_me_returns_current_user(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={
            "name": "Bob",
            "email": "bob@example.com",
            "password": "Password123!",
            "role": "USER",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "Password123!"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == "bob@example.com"

def test_api_me_requires_token(client: TestClient) -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_api_admin_endpoint_blocks_user_role(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={
            "name": "Charlie",
            "email": "charlie@example.com",
            "password": "Password123!",
            "role": "USER",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "charlie@example.com", "password": "Password123!"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/admin-only", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"

def test_api_admin_endpoint_allows_admin_role(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={
            "name": "Admin",
            "email": "admin@example.com",
            "password": "Password123!",
            "role": "ADMIN",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "Password123!"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/admin-only", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json() == {"status": "admin access granted"}

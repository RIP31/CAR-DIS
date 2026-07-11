from fastapi.testclient import TestClient

def _register_and_login(client: TestClient, *, email: str, role: str = "USER") -> str:
    client.post(
        "/api/auth/register",
        json={
            "name": email.split("@")[0].title(),
            "email": email,
            "password": "Password123!",
            "role": role,
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return response.json()["access_token"]

def test_api_create_vehicle(client: TestClient) -> None:
    token = _register_and_login(client, email="admin@example.com", role="ADMIN")
    response = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan",
            "price": 25000,
            "quantity": 5,
            "year": 2024,
            "fuel_type": "Hybrid",
            "transmission": "CVT",
            "description": "Comfortable hybrid sedan",
            "image_url": "http://example.com/camry.jpg",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["make"] == "Toyota"
    assert body["model"] == "Camry"
    assert body["category"] == "Sedan"
    assert body["price"] == 25000
    assert body["quantity"] == 5
    assert body["year"] == 2024
    assert body["fuel_type"] == "Hybrid"
    assert body["transmission"] == "CVT"
    assert body["description"] == "Comfortable hybrid sedan"
    assert body["image_url"] == "http://example.com/camry.jpg"

def test_api_create_vehicle_requires_admin(client: TestClient) -> None:
    token = _register_and_login(client, email="user@example.com", role="USER")
    response = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan",
            "price": 25000,
            "quantity": 5,
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"

def test_api_get_vehicle(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin2@example.com", role="ADMIN")
    created = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Honda",
            "model": "Civic",
            "category": "Sedan",
            "price": 22000,
            "quantity": 3,
        },
    ).json()

    response = client.get(f"/api/vehicles/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]
    assert response.json()["model"] == "Civic"

def test_api_list_vehicles(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin3@example.com", role="ADMIN")
    client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Ford",
            "model": "Mustang",
            "category": "Coupe",
            "price": 45000,
            "quantity": 2,
        },
    )

    response = client.get("/api/vehicles")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_api_update_vehicle(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin4@example.com", role="ADMIN")
    created = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Nissan",
            "model": "Altima",
            "category": "Sedan",
            "price": 21000,
            "quantity": 4,
        },
    ).json()

    response = client.put(
        f"/api/vehicles/{created['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Nissan",
            "model": "Altima X",
            "category": "Sedan",
            "price": 20500,
            "quantity": 6,
            "year": 2023,
            "fuel_type": "Gasoline",
            "transmission": "CVT",
            "description": "Updated Altima model",
            "image_url": "http://example.com/altima_new.jpg",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["model"] == "Altima X"
    assert body["price"] == 20500
    assert body["quantity"] == 6

def test_api_delete_vehicle(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin5@example.com", role="ADMIN")
    created = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "BMW",
            "model": "X5",
            "category": "SUV",
            "price": 65000,
            "quantity": 1,
        },
    ).json()

    response = client.delete(
        f"/api/vehicles/{created['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/vehicles/{created['id']}")
    assert get_resp.status_code == 404

def test_api_purchase_vehicle(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin6@example.com", role="ADMIN")
    user_token = _register_and_login(client, email="buyer@example.com", role="USER")

    created = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Toyota",
            "model": "RAV4",
            "category": "SUV",
            "price": 30000,
            "quantity": 2,
        },
    ).json()

    response = client.post(
        f"/api/vehicles/{created['id']}/purchase",
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 200
    assert response.json()["quantity"] == 1

def test_api_purchase_vehicle_out_of_stock(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin7@example.com", role="ADMIN")
    user_token = _register_and_login(client, email="buyer2@example.com", role="USER")

    created = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Tesla",
            "model": "Model Y",
            "category": "SUV",
            "price": 50000,
            "quantity": 0,
        },
    ).json()

    response = client.post(
        f"/api/vehicles/{created['id']}/purchase",
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Vehicle out of stock"

def test_api_restock_vehicle(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin8@example.com", role="ADMIN")
    created = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Audi",
            "model": "Q7",
            "category": "SUV",
            "price": 60000,
            "quantity": 1,
        },
    ).json()

    response = client.post(
        f"/api/vehicles/{created['id']}/restock?quantity=5",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    assert response.json()["quantity"] == 6

def test_api_search_vehicles(client: TestClient) -> None:
    admin_token = _register_and_login(client, email="admin9@example.com", role="ADMIN")
    # Create two vehicles
    client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Mazda",
            "model": "Mazda3",
            "category": "Hatchback",
            "price": 24000,
            "quantity": 3,
            "year": 2023,
            "fuel_type": "Gasoline",
        },
    )
    client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Mazda",
            "model": "MX-5",
            "category": "Convertible",
            "price": 30000,
            "quantity": 1,
            "year": 2024,
            "fuel_type": "Gasoline",
        },
    )

    # Search with criteria matching MX-5
    response = client.get("/api/vehicles/search?make=Mazda&category=Convertible&min_price=25000&year=2024")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["model"] == "MX-5"

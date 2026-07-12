import uuid
from fastapi.testclient import TestClient
from app.models.purchase import PurchaseStatus

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

def test_reservation_workflow_integration(client: TestClient) -> None:
    # 1. Register Admin & User
    admin_token = _register_and_login(client, email="admin_wf@example.com", role="ADMIN")
    user_token = _register_and_login(client, email="user_wf@example.com", role="USER")

    # 2. Create a vehicle
    vehicle = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "make": "Porsche",
            "model": "911 Carrera",
            "category": "Sports",
            "price": 120000,
            "quantity": 2,
            "year": 2024,
            "fuel_type": "Gasoline",
            "transmission": "PDK",
            "description": "High performance sports car",
            "image_url": "http://example.com/porsche.jpg"
        }
    ).json()

    vehicle_id = vehicle["id"]

    # 3. Create a reservation
    reservation_payload = {
        "vehicle_id": vehicle_id,
        "quantity": 1,
        "phone": "+15550199",
        "alternate_phone": "+15550198",
        "address_line": "123 luxury lane",
        "city": "Beverly Hills",
        "state": "CA",
        "country": "USA",
        "postal_code": "90210",
        "govt_id_type": "Driver License",
        "govt_id_number": "DL12345678",
        "driving_license_number": "DL12345678",
        "date_of_birth": "1990-05-15",
        "finance_required": True,
        "trade_in_required": False,
        "preferred_visit_date": "2026-07-20",
        "preferred_visit_time": "14:00",
        "customer_notes": "Please prepare model with red leather interior."
    }

    create_res = client.post(
        "/api/purchases",
        headers={"Authorization": f"Bearer {user_token}"},
        json=reservation_payload
    )
    assert create_res.status_code == 201
    res_data = create_res.json()
    assert res_data["status"] == "Reservation Submitted"
    assert res_data["reservation_number"].startswith("RES-")
    assert res_data["phone"] == "+15550199"

    # Verify vehicle stock reduced from 2 to 1
    vehicle_after = client.get(f"/api/vehicles/{vehicle_id}").json()
    assert vehicle_after["quantity"] == 1

    # 4. Admin updates status to 'Dealer Reviewing' with notes
    purchase_id = res_data["id"]
    update_res1 = client.patch(
        f"/api/admin/purchases/{purchase_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "status": "Dealer Reviewing",
            "dealer_notes": "Assigned to sales consultant Rick.",
            "expected_delivery_date": "2026-08-01"
        }
    )
    assert update_res1.status_code == 200
    res_data1 = update_res1.json()
    assert res_data1["status"] == "Dealer Reviewing"
    assert res_data1["dealer_notes"] == "Assigned to sales consultant Rick."
    assert res_data1["expected_delivery_date"] == "2026-08-01"

    # 5. Verify notification created for status change
    notif_res = client.get(
        "/api/notifications",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert notif_res.status_code == 200
    notifications = notif_res.json()
    assert len(notifications) >= 1
    # Most recent notification first
    latest_notif = notifications[0]
    assert latest_notif["title"] == "Dealer Reviewing"
    assert "reviewing" in latest_notif["message"]
    assert latest_notif["is_read"] is False

    # Mark notification as read
    notif_id = latest_notif["id"]
    read_res = client.post(
        f"/api/notifications/{notif_id}/read",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert read_res.status_code == 200

    # Verify read status
    notif_res2 = client.get(
        "/api/notifications",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert notif_res2.json()[0]["is_read"] is True

    # 6. Cancel reservation to verify stock recovery
    cancel_res = client.patch(
        f"/api/admin/purchases/{purchase_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "status": "Cancelled",
            "dealer_notes": "Cancelled by customer request."
        }
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "Cancelled"

    # Verify stock restored back to 2
    vehicle_restored = client.get(f"/api/vehicles/{vehicle_id}").json()
    assert vehicle_restored["quantity"] == 2

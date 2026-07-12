import requests

def test_flow():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Login
    login_payload = {
        "email": "test@example.com",
        "password": "Password123!"
    }
    r = requests.post(f"{base_url}/api/auth/login", json=login_payload)
    print("Login Status:", r.status_code)
    if r.status_code != 200:
        print("Login failed:", r.text)
        return
        
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get a vehicle ID
    r = requests.get(f"{base_url}/api/vehicles")
    print("Get Vehicles Status:", r.status_code)
    vehicles = r.json()
    if not vehicles:
        print("No vehicles in db")
        return
    vehicle_id = vehicles[0]["id"]
    print("Selected Vehicle ID:", vehicle_id)
    
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
    r = requests.post(f"{base_url}/api/purchases", headers=headers, json=reservation_payload)
    print("Create Reservation Status:", r.status_code)
    print("Response:", r.text)

if __name__ == "__main__":
    test_flow()

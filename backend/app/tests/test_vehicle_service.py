from sqlalchemy.orm import Session
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleSearchParams
from app.services.vehicle_service import VehicleService

def test_vehicle_service_workflow(db_session: Session):
    service = VehicleService(db_session)
    
    # 1. Create
    payload = VehicleCreate(
        make="Toyota",
        model="Camry",
        category="Sedan",
        price=25000.0,
        quantity=5,
        year=2024,
        fuel_type="Hybrid",
        transmission="CVT",
        description="Hybrid sedan",
        image_url="http://example.com/camry.jpg"
    )
    vehicle = service.create_vehicle(payload)
    assert vehicle.id is not None
    assert vehicle.model == "Camry"

    # 2. Get
    found = service.get_vehicle(vehicle.id)
    assert found is not None
    assert found.price == 25000.0

    # 3. Update
    update_payload = VehicleUpdate(
        make="Toyota",
        model="Camry XSE",
        category="Sedan",
        price=27000.0,
        quantity=4,
        year=2024,
        fuel_type="Hybrid",
        transmission="CVT",
        description="Premium Hybrid sedan",
        image_url="http://example.com/camry_premium.jpg"
    )
    updated = service.update_vehicle(vehicle, update_payload)
    assert updated.model == "Camry XSE"
    assert updated.price == 27000.0

    # 4. Search
    search_params = VehicleSearchParams(make="Toyota", category="Sedan")
    search_results = service.search_vehicles(search_params)
    assert len(search_results) == 1
    assert search_results[0].model == "Camry XSE"

    # 5. List All
    all_vehicles = service.get_all_vehicles()
    assert len(all_vehicles) == 1

    # 6. Delete
    service.delete_vehicle(vehicle)
    assert service.get_vehicle(vehicle.id) is None

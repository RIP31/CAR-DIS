from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository

def test_vehicle_repository_create_and_get(db_session: Session):
    repo = VehicleRepository(db_session)
    vehicle = repo.create_vehicle(
        make="Tesla",
        model="Model S",
        category="Sedan",
        price=80000.0,
        quantity=3,
        year=2024,
        fuel_type="Electric",
        transmission="Automatic",
        description="Electric luxury sedan",
        image_url="http://example.com/models.jpg"
    )

    assert vehicle.id is not None
    assert vehicle.make == "Tesla"
    
    found = repo.get_vehicle(vehicle.id)
    assert found is not None
    assert found.model == "Model S"

def test_vehicle_repository_get_all(db_session: Session):
    repo = VehicleRepository(db_session)
    repo.create_vehicle(make="Ford", model="Mustang", category="Coupe", price=45000.0, quantity=2)
    repo.create_vehicle(make="Chevy", model="Camaro", category="Coupe", price=42000.0, quantity=1)

    all_vehicles = repo.get_all_vehicles()
    assert len(all_vehicles) == 2

def test_vehicle_repository_update(db_session: Session):
    repo = VehicleRepository(db_session)
    vehicle = repo.create_vehicle(make="Nissan", model="Rogue", category="SUV", price=30000.0, quantity=5)

    updated = repo.update_vehicle(
        vehicle,
        make="Nissan",
        model="Rogue Platinum",
        category="SUV",
        price=35000.0,
        quantity=3,
        year=2024,
        fuel_type="Gasoline",
        transmission="CVT",
        description="Updated model description",
        image_url="http://example.com/rogue.jpg"
    )

    assert updated.model == "Rogue Platinum"
    assert updated.price == 35000.0
    assert updated.quantity == 3
    assert updated.description == "Updated model description"

def test_vehicle_repository_delete(db_session: Session):
    repo = VehicleRepository(db_session)
    vehicle = repo.create_vehicle(make="Mazda", model="CX-5", category="SUV", price=28000.0, quantity=4)

    repo.delete_vehicle(vehicle)
    assert repo.get_vehicle(vehicle.id) is None

def test_vehicle_repository_search(db_session: Session):
    repo = VehicleRepository(db_session)
    # Create multiple vehicles
    v1 = repo.create_vehicle(make="Toyota", model="RAV4", category="SUV", price=32000.0, quantity=4, year=2023, fuel_type="Gasoline")
    v2 = repo.create_vehicle(make="Toyota", model="Prius", category="Hatchback", price=28000.0, quantity=2, year=2024, fuel_type="Hybrid")
    v3 = repo.create_vehicle(make="Honda", model="CR-V", category="SUV", price=31000.0, quantity=5, year=2023, fuel_type="Gasoline")

    # Search by make
    toyotas = repo.search_vehicles(make="Toyota")
    assert len(toyotas) == 2
    
    # Search by category
    suvs = repo.search_vehicles(category="SUV")
    assert len(suvs) == 2

    # Search by price range
    mid_price = repo.search_vehicles(min_price=30000.0, max_price=33000.0)
    assert len(mid_price) == 2

    # Search by year
    y2024 = repo.search_vehicles(year=2024)
    assert len(y2024) == 1
    assert y2024[0].model == "Prius"

    # Search by fuel type
    gas = repo.search_vehicles(fuel_type="Gasoline")
    assert len(gas) == 2

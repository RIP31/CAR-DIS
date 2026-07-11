from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle

def test_create_vehicle_model(db_session: Session):
    vehicle = Vehicle(
        make="Toyota",
        model="Camry",
        category="Sedan",
        price=25000.0,
        quantity=5,
        year=2024,
        fuel_type="Hybrid",
        transmission="CVT",
        description="Comfortable hybrid sedan",
        image_url="http://example.com/camry.jpg"
    )
    db_session.add(vehicle)
    db_session.commit()
    db_session.refresh(vehicle)

    assert vehicle.id is not None
    assert vehicle.make == "Toyota"
    assert vehicle.model == "Camry"
    assert vehicle.category == "Sedan"
    assert vehicle.price == 25000.0
    assert vehicle.quantity == 5
    assert vehicle.year == 2024
    assert vehicle.fuel_type == "Hybrid"
    assert vehicle.transmission == "CVT"
    assert vehicle.description == "Comfortable hybrid sedan"
    assert vehicle.image_url == "http://example.com/camry.jpg"
    assert vehicle.created_at is not None
    assert vehicle.updated_at is not None

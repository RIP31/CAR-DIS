from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle

class VehicleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_vehicle(
        self,
        *,
        make: str,
        model: str,
        category: str,
        price: float,
        quantity: int,
        year: int = 2023,
        fuel_type: str = "Gasoline",
        transmission: str = "Automatic",
        description: str | None = None,
        image_url: str | None = None,
    ) -> Vehicle:
        vehicle = Vehicle(
            make=make,
            model=model,
            category=category,
            price=price,
            quantity=quantity,
            year=year,
            fuel_type=fuel_type,
            transmission=transmission,
            description=description,
            image_url=image_url,
        )
        self.db.add(vehicle)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def get_vehicle(self, vehicle_id: str) -> Vehicle | None:
        return self.db.get(Vehicle, vehicle_id)

    def get_all_vehicles(self) -> list[Vehicle]:
        statement = select(Vehicle).order_by(Vehicle.created_at.desc())
        return list(self.db.execute(statement).scalars().all())

    def update_vehicle(
        self,
        vehicle: Vehicle,
        *,
        make: str,
        model: str,
        category: str,
        price: float,
        quantity: int,
        year: int,
        fuel_type: str,
        transmission: str,
        description: str | None,
        image_url: str | None,
    ) -> Vehicle:
        vehicle.make = make
        vehicle.model = model
        vehicle.category = category
        vehicle.price = price
        vehicle.quantity = quantity
        vehicle.year = year
        vehicle.fuel_type = fuel_type
        vehicle.transmission = transmission
        vehicle.description = description
        vehicle.image_url = image_url
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete_vehicle(self, vehicle: Vehicle) -> None:
        self.db.delete(vehicle)
        self.db.commit()

    def search_vehicles(
        self,
        *,
        make: str | None = None,
        model: str | None = None,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        year: int | None = None,
        fuel_type: str | None = None,
        transmission: str | None = None,
    ) -> list[Vehicle]:
        statement = select(Vehicle)
        if make:
            statement = statement.where(Vehicle.make.ilike(f"%{make}%"))
        if model:
            statement = statement.where(Vehicle.model.ilike(f"%{model}%"))
        if category:
            statement = statement.where(Vehicle.category.ilike(f"%{category}%"))
        if min_price is not None:
            statement = statement.where(Vehicle.price >= min_price)
        if max_price is not None:
            statement = statement.where(Vehicle.price <= max_price)
        if year is not None:
            statement = statement.where(Vehicle.year == year)
        if fuel_type:
            statement = statement.where(Vehicle.fuel_type.ilike(f"%{fuel_type}%"))
        if transmission:
            statement = statement.where(Vehicle.transmission.ilike(f"%{transmission}%"))
        statement = statement.order_by(Vehicle.created_at.desc())
        return list(self.db.execute(statement).scalars().all())

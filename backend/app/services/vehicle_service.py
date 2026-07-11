from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.vehicle import VehicleCreate, VehicleSearchParams, VehicleUpdate

class VehicleService:
    def __init__(self, db: Session) -> None:
        self.repository = VehicleRepository(db)

    def create_vehicle(self, payload: VehicleCreate) -> Vehicle:
        return self.repository.create_vehicle(
            make=payload.make,
            model=payload.model,
            category=payload.category,
            price=payload.price,
            quantity=payload.quantity,
            year=payload.year,
            fuel_type=payload.fuel_type,
            transmission=payload.transmission,
            description=payload.description,
            image_url=payload.image_url,
        )

    def get_vehicle(self, vehicle_id: str) -> Vehicle | None:
        return self.repository.get_vehicle(vehicle_id)

    def get_all_vehicles(self) -> list[Vehicle]:
        return self.repository.get_all_vehicles()

    def update_vehicle(self, vehicle: Vehicle, payload: VehicleUpdate) -> Vehicle:
        return self.repository.update_vehicle(
            vehicle,
            make=payload.make,
            model=payload.model,
            category=payload.category,
            price=payload.price,
            quantity=payload.quantity,
            year=payload.year,
            fuel_type=payload.fuel_type,
            transmission=payload.transmission,
            description=payload.description,
            image_url=payload.image_url,
        )

    def delete_vehicle(self, vehicle: Vehicle) -> None:
        self.repository.delete_vehicle(vehicle)

    def search_vehicles(self, params: VehicleSearchParams) -> list[Vehicle]:
        return self.repository.search_vehicles(
            make=params.make,
            model=params.model,
            category=params.category,
            min_price=params.min_price,
            max_price=params.max_price,
            year=params.year,
            fuel_type=params.fuel_type,
            transmission=params.transmission,
        )

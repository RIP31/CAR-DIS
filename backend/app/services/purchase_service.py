from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.purchase import Purchase, PurchaseStatus
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.purchase import PurchaseCreate, PurchaseStatusUpdate

class PurchaseService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = PurchaseRepository(db)
        self.vehicle_repository = VehicleRepository(db)

    def create_purchase(self, user_id: str, payload: PurchaseCreate) -> Purchase:
        vehicle = self.vehicle_repository.get_vehicle(payload.vehicle_id)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )
        if vehicle.quantity < payload.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle out of stock",
            )
        vehicle.quantity -= payload.quantity
        purchase = self.repository.create_purchase(
            user_id=user_id,
            vehicle_id=vehicle.id,
            vehicle_name=f"{vehicle.make} {vehicle.model}",
            purchase_price=vehicle.price * payload.quantity,
            quantity=payload.quantity,
        )
        return purchase

    def get_user_purchases(self, user_id: str) -> list[Purchase]:
        return self.repository.get_purchases_by_user(user_id)

    def get_all_purchases(self) -> list[Purchase]:
        return self.repository.get_all_purchases()

    def update_status(self, purchase_id: str, payload: PurchaseStatusUpdate) -> Purchase:
        purchase = self.repository.get_purchase(purchase_id)
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found",
            )
        return self.repository.update_status(purchase, payload.status)

    def get_purchase(self, purchase_id: str) -> Purchase | None:
        return self.repository.get_purchase(purchase_id)

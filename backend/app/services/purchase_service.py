from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import json
import uuid
from datetime import datetime, timezone
from app.models.purchase import Purchase, PurchaseStatus
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.purchase import PurchaseCreate, PurchaseStatusUpdate

class PurchaseService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = PurchaseRepository(db)
        self.vehicle_repository = VehicleRepository(db)
        self.user_repository = UserRepository(db)

    def create_purchase(self, user_id: str, payload: PurchaseCreate) -> Purchase:
        user = self.user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
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
        
        variant = "Standard"
        if vehicle.description:
            try:
                desc_data = json.loads(vehicle.description)
                variant = desc_data.get("variant") or "Standard"
            except Exception:
                pass

        invoice_number = f"INV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        vehicle.quantity -= payload.quantity
        purchase = self.repository.create_purchase(
            user_id=user_id,
            customer_name=user.name,
            customer_email=user.email,
            vehicle_id=vehicle.id,
            vehicle_name=f"{vehicle.make} {vehicle.model}",
            manufacturer=vehicle.make,
            model=vehicle.model,
            variant=variant,
            purchase_price=vehicle.price * payload.quantity,
            quantity=payload.quantity,
            invoice_number=invoice_number,
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

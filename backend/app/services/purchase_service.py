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

from app.models.notification import Notification

class PurchaseService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = PurchaseRepository(db)
        self.vehicle_repository = VehicleRepository(db)
        self.user_repository = UserRepository(db)

    def _create_notification(self, user_id: str, title: str, message: str) -> None:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
        )
        self.db.add(notification)
        self.db.commit()

    def _get_notification_content(self, status: PurchaseStatus, vehicle_name: str) -> tuple[str, str]:
        mapping = {
            PurchaseStatus.RESERVATION_SUBMITTED: (
                "Reservation Submitted",
                f"Your reservation request for {vehicle_name} has been submitted successfully."
            ),
            PurchaseStatus.DEALER_REVIEWING: (
                "Dealer Reviewing",
                f"A dealer representative is currently reviewing your reservation for {vehicle_name}."
            ),
            PurchaseStatus.CONFIRMED: (
                "Reservation Confirmed",
                f"Dealer accepted your reservation for {vehicle_name}."
            ),
            PurchaseStatus.DOCUMENTS_VERIFICATION: (
                "Documents Verification",
                "Your documents are currently undergoing verification."
            ),
            PurchaseStatus.FINANCE_APPROVAL: (
                "Finance Approved",
                "Your vehicle finance application has been approved."
            ),
            PurchaseStatus.PAYMENT_PENDING: (
                "Payment Pending",
                "Your reservation payment is pending. Please complete the transaction."
            ),
            PurchaseStatus.PAYMENT_RECEIVED: (
                "Payment Received",
                f"Payment has been received successfully for your {vehicle_name} reservation."
            ),
            PurchaseStatus.READY_FOR_DELIVERY: (
                "Ready for Delivery",
                f"Your vehicle {vehicle_name} is prepped and ready for delivery."
            ),
            PurchaseStatus.DELIVERED: (
                "Vehicle Delivered",
                f"Congratulations! Your {vehicle_name} has been delivered successfully."
            ),
            PurchaseStatus.CANCELLED: (
                "Reservation Cancelled",
                f"Your reservation request for {vehicle_name} was cancelled."
            ),
            PurchaseStatus.REJECTED: (
                "Reservation Rejected",
                f"Your reservation request for {vehicle_name} was rejected by the dealer."
            )
        }
        return mapping.get(status, ("Status Update", f"Your reservation status is now {status.value}."))

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
        reservation_number = f"RES-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        customer_name = payload.customer_name or user.name
        customer_email = payload.customer_email or user.email

        initial_timeline = [
            {
                "status": PurchaseStatus.RESERVATION_SUBMITTED.value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "note": "Reservation request successfully submitted by the customer."
            }
        ]

        vehicle.quantity -= payload.quantity
        phone = payload.phone or "N/A"
        address_line = payload.address_line or "N/A"
        city = payload.city or "N/A"
        state = payload.state or "N/A"
        country = payload.country or "N/A"
        postal_code = payload.postal_code or "N/A"
        govt_id_type = payload.govt_id_type or "N/A"
        govt_id_number = payload.govt_id_number or "N/A"
        date_of_birth = payload.date_of_birth or "N/A"
        preferred_visit_date = payload.preferred_visit_date or "N/A"
        preferred_visit_time = payload.preferred_visit_time or "N/A"
        finance_required = payload.finance_required if payload.finance_required is not None else False
        trade_in_required = payload.trade_in_required if payload.trade_in_required is not None else False

        purchase = self.repository.create_purchase(
            user_id=user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            vehicle_id=vehicle.id,
            vehicle_name=f"{vehicle.make} {vehicle.model}",
            manufacturer=vehicle.make,
            model=vehicle.model,
            variant=variant,
            purchase_price=vehicle.price * payload.quantity,
            quantity=payload.quantity,
            invoice_number=invoice_number,
            reservation_number=reservation_number,
            phone=phone,
            alternate_phone=payload.alternate_phone,
            address_line=address_line,
            city=city,
            state=state,
            country=country,
            postal_code=postal_code,
            govt_id_type=govt_id_type,
            govt_id_number=govt_id_number,
            driving_license_number=payload.driving_license_number,
            date_of_birth=date_of_birth,
            preferred_visit_date=preferred_visit_date,
            preferred_visit_time=preferred_visit_time,
            finance_required=finance_required,
            trade_in_required=trade_in_required,
            customer_notes=payload.customer_notes,
            timeline=json.dumps(initial_timeline),
            reservation_status=PurchaseStatus.RESERVATION_SUBMITTED.value,
        )

        self._create_notification(
            user_id=user_id,
            title="Reservation Submitted",
            message=f"Your reservation request for {vehicle.make} {vehicle.model} has been submitted successfully (Reservation: {reservation_number})."
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
        
        # Restore stock if cancelled or rejected
        if payload.status in [PurchaseStatus.CANCELLED, PurchaseStatus.REJECTED] and purchase.status not in [PurchaseStatus.CANCELLED, PurchaseStatus.REJECTED]:
            if purchase.vehicle_id:
                vehicle = self.vehicle_repository.get_vehicle(purchase.vehicle_id)
                if vehicle:
                    vehicle.quantity += purchase.quantity

        current_timeline = []
        if purchase.timeline:
            try:
                current_timeline = json.loads(purchase.timeline)
            except Exception:
                pass

        transition_note = payload.dealer_notes or f"Reservation status updated to {payload.status.value}."
        current_timeline.append({
            "status": payload.status.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": transition_note
        })
        new_timeline_json = json.dumps(current_timeline)

        updated_purchase = self.repository.update_status(
            purchase=purchase,
            status=payload.status,
            dealer_notes=payload.dealer_notes,
            expected_delivery_date=payload.expected_delivery_date,
            timeline=new_timeline_json
        )

        # Notify user
        title, msg = self._get_notification_content(payload.status, purchase.vehicle_name)
        self._create_notification(
            user_id=purchase.user_id,
            title=title,
            message=msg
        )

        return updated_purchase

    def get_purchase(self, purchase_id: str) -> Purchase | None:
        return self.repository.get_purchase(purchase_id)

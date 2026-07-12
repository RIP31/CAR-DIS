from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.purchase import Purchase, PurchaseStatus

class PurchaseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_purchase(
        self,
        *,
        user_id: str,
        customer_name: str,
        customer_email: str,
        vehicle_id: str,
        vehicle_name: str,
        manufacturer: str,
        model: str,
        variant: str,
        purchase_price: float,
        quantity: int = 1,
        invoice_number: str,
        reservation_number: str,
        phone: str,
        alternate_phone: str | None = None,
        address_line: str,
        city: str,
        state: str,
        country: str,
        postal_code: str,
        govt_id_type: str,
        govt_id_number: str,
        driving_license_number: str | None = None,
        date_of_birth: str,
        preferred_visit_date: str,
        preferred_visit_time: str,
        finance_required: bool,
        trade_in_required: bool,
        customer_notes: str | None = None,
        dealer_notes: str | None = None,
        expected_delivery_date: str | None = None,
        timeline: str | None = None,
        reservation_status: str | None = "Reservation Submitted",
    ) -> Purchase:
        purchase = Purchase(
            user_id=user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            vehicle_id=vehicle_id,
            vehicle_name=vehicle_name,
            manufacturer=manufacturer,
            model=model,
            variant=variant,
            purchase_price=purchase_price,
            quantity=quantity,
            invoice_number=invoice_number,
            reservation_number=reservation_number,
            phone=phone,
            alternate_phone=alternate_phone,
            address_line=address_line,
            city=city,
            state=state,
            country=country,
            postal_code=postal_code,
            govt_id_type=govt_id_type,
            govt_id_number=govt_id_number,
            driving_license_number=driving_license_number,
            date_of_birth=date_of_birth,
            preferred_visit_date=preferred_visit_date,
            preferred_visit_time=preferred_visit_time,
            finance_required=finance_required,
            trade_in_required=trade_in_required,
            customer_notes=customer_notes,
            dealer_notes=dealer_notes,
            expected_delivery_date=expected_delivery_date,
            timeline=timeline,
            reservation_status=reservation_status,
        )
        self.db.add(purchase)
        self.db.commit()
        self.db.refresh(purchase)
        return purchase

    def get_purchase(self, purchase_id: str) -> Purchase | None:
        return self.db.get(Purchase, purchase_id)

    def get_purchases_by_user(self, user_id: str) -> list[Purchase]:
        statement = (
            select(Purchase)
            .where(Purchase.user_id == user_id)
            .order_by(Purchase.created_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())

    def get_all_purchases(self) -> list[Purchase]:
        statement = select(Purchase).order_by(Purchase.created_at.desc())
        return list(self.db.execute(statement).scalars().all())

    def update_status(
        self,
        purchase: Purchase,
        status: PurchaseStatus,
        dealer_notes: str | None = None,
        expected_delivery_date: str | None = None,
        timeline: str | None = None,
    ) -> Purchase:
        purchase.status = status
        purchase.reservation_status = status.value
        if dealer_notes is not None:
            purchase.dealer_notes = dealer_notes
        if expected_delivery_date is not None:
            purchase.expected_delivery_date = expected_delivery_date
        if timeline is not None:
            purchase.timeline = timeline
        self.db.commit()
        self.db.refresh(purchase)
        return purchase

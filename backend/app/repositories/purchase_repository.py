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
        vehicle_id: str,
        vehicle_name: str,
        purchase_price: float,
        quantity: int = 1,
    ) -> Purchase:
        purchase = Purchase(
            user_id=user_id,
            vehicle_id=vehicle_id,
            vehicle_name=vehicle_name,
            purchase_price=purchase_price,
            quantity=quantity,
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

    def update_status(self, purchase: Purchase, status: PurchaseStatus) -> Purchase:
        purchase.status = status
        self.db.commit()
        self.db.refresh(purchase)
        return purchase

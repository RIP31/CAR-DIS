from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session
from app.models.wishlist import WishlistItem

class WishlistRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add_item(self, *, user_id: str, vehicle_id: str) -> WishlistItem:
        item = WishlistItem(user_id=user_id, vehicle_id=vehicle_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def remove_item(self, user_id: str, vehicle_id: str) -> bool:
        statement = (
            delete(WishlistItem)
            .where(WishlistItem.user_id == user_id)
            .where(WishlistItem.vehicle_id == vehicle_id)
        )
        result = self.db.execute(statement)
        self.db.commit()
        return result.rowcount > 0

    def get_user_wishlist(self, user_id: str) -> list[WishlistItem]:
        statement = (
            select(WishlistItem)
            .where(WishlistItem.user_id == user_id)
            .order_by(WishlistItem.created_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())

    def get_count(self, user_id: str) -> int:
        statement = (
            select(func.count())
            .select_from(WishlistItem)
            .where(WishlistItem.user_id == user_id)
        )
        return self.db.execute(statement).scalar_one()

    def is_in_wishlist(self, user_id: str, vehicle_id: str) -> bool:
        statement = (
            select(WishlistItem)
            .where(WishlistItem.user_id == user_id)
            .where(WishlistItem.vehicle_id == vehicle_id)
        )
        return self.db.execute(statement).scalar_one_or_none() is not None

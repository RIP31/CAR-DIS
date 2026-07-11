from sqlalchemy.orm import Session
from app.models.wishlist import WishlistItem
from app.repositories.wishlist_repository import WishlistRepository

class WishlistService:
    def __init__(self, db: Session) -> None:
        self.repository = WishlistRepository(db)

    def toggle_wishlist(self, user_id: str, vehicle_id: str) -> dict:
        if self.repository.is_in_wishlist(user_id, vehicle_id):
            self.repository.remove_item(user_id, vehicle_id)
            return {"action": "removed"}
        self.repository.add_item(user_id=user_id, vehicle_id=vehicle_id)
        return {"action": "added"}

    def get_user_wishlist(self, user_id: str) -> list[WishlistItem]:
        return self.repository.get_user_wishlist(user_id)

    def get_count(self, user_id: str) -> int:
        return self.repository.get_count(user_id)

    def check_item(self, user_id: str, vehicle_id: str) -> bool:
        return self.repository.is_in_wishlist(user_id, vehicle_id)

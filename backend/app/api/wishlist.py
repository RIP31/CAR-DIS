from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.vehicle import VehicleResponse
from app.schemas.wishlist import WishlistCountResponse
from app.services.wishlist_service import WishlistService

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.post("/{vehicle_id}", status_code=status.HTTP_200_OK)
def toggle_wishlist(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return WishlistService(db).toggle_wishlist(current_user.id, vehicle_id)

@router.get("/count", response_model=WishlistCountResponse)
def get_wishlist_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WishlistCountResponse:
    count = WishlistService(db).get_count(current_user.id)
    return WishlistCountResponse(count=count)

@router.get("/check/{vehicle_id}")
def check_wishlist(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    in_wishlist = WishlistService(db).check_item(current_user.id, vehicle_id)
    return {"in_wishlist": in_wishlist}

@router.get("", response_model=list[VehicleResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[VehicleResponse]:
    items = WishlistService(db).get_user_wishlist(current_user.id)
    return [VehicleResponse.model_validate(item.vehicle) for item in items]

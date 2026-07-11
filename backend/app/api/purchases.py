from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.user import User
from app.schemas.purchase import PurchaseCreate, PurchaseResponse, PurchaseStatusUpdate
from app.services.purchase_service import PurchaseService

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])

@router.post("", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
def create_purchase(
    payload: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PurchaseResponse:
    purchase = PurchaseService(db).create_purchase(current_user.id, payload)
    return PurchaseResponse.model_validate(purchase)

@router.get("/my", response_model=list[PurchaseResponse])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PurchaseResponse]:
    purchases = PurchaseService(db).get_user_purchases(current_user.id)
    return [PurchaseResponse.model_validate(p) for p in purchases]

@router.get("", response_model=list[PurchaseResponse])
def get_all_purchases(
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> list[PurchaseResponse]:
    purchases = PurchaseService(db).get_all_purchases()
    return [PurchaseResponse.model_validate(p) for p in purchases]

@router.get("/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(
    purchase_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PurchaseResponse:
    service = PurchaseService(db)
    purchase = service.get_purchase(purchase_id)
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found",
        )
    return PurchaseResponse.model_validate(purchase)

@router.patch("/{purchase_id}/status", response_model=PurchaseResponse)
def update_purchase_status(
    purchase_id: str,
    payload: PurchaseStatusUpdate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> PurchaseResponse:
    purchase = PurchaseService(db).update_status(purchase_id, payload)
    return PurchaseResponse.model_validate(purchase)

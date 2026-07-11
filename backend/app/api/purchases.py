from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.user import User
from app.schemas.purchase import PurchaseCreate, PurchaseResponse, PurchaseStatusUpdate
from app.services.purchase_service import PurchaseService

router = APIRouter(tags=["Purchases"])

@router.post("/api/purchases", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
def create_purchase(
    payload: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PurchaseResponse:
    purchase = PurchaseService(db).create_purchase(current_user.id, payload)
    return PurchaseResponse.model_validate(purchase)

@router.get("/api/purchases/my-purchases", response_model=list[PurchaseResponse])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PurchaseResponse]:
    purchases = PurchaseService(db).get_user_purchases(current_user.id)
    return [PurchaseResponse.model_validate(p) for p in purchases]

@router.get("/api/purchases/{purchaseId}", response_model=PurchaseResponse)
def get_purchase(
    purchaseId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PurchaseResponse:
    service = PurchaseService(db)
    purchase = service.get_purchase(purchaseId)
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found",
        )
    # Check authorization: user can only view their own purchases, admin can view all
    if current_user.role != "ADMIN" and purchase.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this purchase",
        )
    return PurchaseResponse.model_validate(purchase)

# Admin endpoints
@router.get("/api/admin/purchases", response_model=list[PurchaseResponse])
def get_admin_purchases(
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> list[PurchaseResponse]:
    purchases = PurchaseService(db).get_all_purchases()
    return [PurchaseResponse.model_validate(p) for p in purchases]

@router.get("/api/admin/purchases/{purchaseId}", response_model=PurchaseResponse)
def get_admin_purchase(
    purchaseId: str,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> PurchaseResponse:
    service = PurchaseService(db)
    purchase = service.get_purchase(purchaseId)
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found",
        )
    return PurchaseResponse.model_validate(purchase)

@router.patch("/api/admin/purchases/{purchaseId}/status", response_model=PurchaseResponse)
def update_purchase_status(
    purchaseId: str,
    payload: PurchaseStatusUpdate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
) -> PurchaseResponse:
    purchase = PurchaseService(db).update_status(purchaseId, payload)
    return PurchaseResponse.model_validate(purchase)

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.purchase import PurchaseStatus

class PurchaseCreate(BaseModel):
    vehicle_id: str = Field(min_length=1)
    quantity: int = Field(default=1, ge=1)

class PurchaseStatusUpdate(BaseModel):
    status: PurchaseStatus

class PurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    vehicle_id: str | None
    vehicle_name: str
    purchase_price: float
    quantity: int
    status: PurchaseStatus
    purchase_date: datetime
    created_at: datetime
    updated_at: datetime

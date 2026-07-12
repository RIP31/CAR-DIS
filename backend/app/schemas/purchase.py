from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.purchase import PurchaseStatus

class PurchaseCreate(BaseModel):
    vehicle_id: str = Field(min_length=1)
    quantity: int = Field(default=1, ge=1)
    
    # Step 1: Personal info (prefilled or custom)
    customer_name: str | None = None
    customer_email: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None

    # Step 2: Address
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None

    # Step 3: Identity info
    govt_id_type: str | None = None
    govt_id_number: str | None = None
    driving_license_number: str | None = None
    date_of_birth: str | None = None

    # Step 4: Purchase Preferences
    finance_required: bool | None = False
    trade_in_required: bool | None = False
    preferred_visit_date: str | None = None
    preferred_visit_time: str | None = None
    customer_notes: str | None = None

class PurchaseStatusUpdate(BaseModel):
    status: PurchaseStatus
    dealer_notes: str | None = None
    expected_delivery_date: str | None = None

class PurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    customer_name: str
    customer_email: str
    vehicle_id: str | None
    vehicle_name: str
    manufacturer: str
    model: str
    variant: str
    purchase_price: float
    quantity: int
    invoice_number: str
    status: PurchaseStatus
    purchase_date: datetime
    created_at: datetime
    updated_at: datetime

    # Reservation workflow fields
    reservation_number: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    govt_id_type: str | None = None
    govt_id_number: str | None = None
    driving_license_number: str | None = None
    date_of_birth: str | None = None
    preferred_visit_date: str | None = None
    preferred_visit_time: str | None = None
    finance_required: bool | None = None
    trade_in_required: bool | None = None
    customer_notes: str | None = None
    dealer_notes: str | None = None
    expected_delivery_date: str | None = None
    timeline: str | None = None
    reservation_status: str | None = None

import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class PurchaseStatus(str, Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    PAYMENT_PENDING = "Payment Pending"
    DOCUMENTS_PENDING = "Documents Pending"
    READY_FOR_DELIVERY = "Ready for Delivery"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)
    vehicle_id: Mapped[str | None] = mapped_column(
        ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    vehicle_name: Mapped[str] = mapped_column(String(255), nullable=False)
    manufacturer: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    variant: Mapped[str] = mapped_column(String(100), nullable=False)
    purchase_price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    status: Mapped[PurchaseStatus] = mapped_column(
        SAEnum(PurchaseStatus, name="purchase_status", native_enum=False),
        nullable=False,
        default=PurchaseStatus.PENDING,
    )
    purchase_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

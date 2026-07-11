from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.callback import CallbackRequest

class CallbackRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_request(
        self,
        *,
        name: str,
        phone: str,
        preferred_time: str,
        message: str | None = None,
        vehicle_id: str | None = None,
    ) -> CallbackRequest:
        callback = CallbackRequest(
            name=name,
            phone=phone,
            preferred_time=preferred_time,
            message=message,
            vehicle_id=vehicle_id,
        )
        self.db.add(callback)
        self.db.commit()
        self.db.refresh(callback)
        return callback

    def get_all_requests(self) -> list[CallbackRequest]:
        statement = select(CallbackRequest).order_by(CallbackRequest.created_at.desc())
        return list(self.db.execute(statement).scalars().all())

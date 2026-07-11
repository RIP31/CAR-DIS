from sqlalchemy.orm import Session
from app.models.callback import CallbackRequest
from app.repositories.callback_repository import CallbackRepository
from app.schemas.callback import CallbackCreate

class CallbackService:
    def __init__(self, db: Session) -> None:
        self.repository = CallbackRepository(db)

    def create_request(self, payload: CallbackCreate) -> CallbackRequest:
        return self.repository.create_request(
            name=payload.name,
            phone=payload.phone,
            preferred_time=payload.preferred_time,
            message=payload.message,
            vehicle_id=payload.vehicle_id,
        )

    def get_all_requests(self) -> list[CallbackRequest]:
        return self.repository.get_all_requests()

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.schemas.callback import CallbackCreate, CallbackResponse
from app.services.callback_service import CallbackService

router = APIRouter(prefix="/api/callbacks", tags=["Callbacks"])

@router.post("", response_model=CallbackResponse, status_code=status.HTTP_201_CREATED)
def create_callback(
    payload: CallbackCreate,
    db: Session = Depends(get_db),
) -> CallbackResponse:
    callback = CallbackService(db).create_request(payload)
    return CallbackResponse.model_validate(callback)

@router.get("", response_model=list[CallbackResponse])
def list_callbacks(
    db: Session = Depends(get_db),
    _current_admin=Depends(get_current_admin),
) -> list[CallbackResponse]:
    callbacks = CallbackService(db).get_all_requests()
    return [CallbackResponse.model_validate(cb) for cb in callbacks]

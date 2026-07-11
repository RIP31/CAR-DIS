from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CallbackCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=30)
    preferred_time: str = Field(min_length=1, max_length=50)
    message: str | None = None
    vehicle_id: str | None = None

class CallbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    phone: str
    preferred_time: str
    message: str | None
    vehicle_id: str | None
    created_at: datetime

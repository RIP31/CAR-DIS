from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WishlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    vehicle_id: str
    created_at: datetime

class WishlistCountResponse(BaseModel):
    count: int

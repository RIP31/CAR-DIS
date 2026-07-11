from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class VehicleCreate(BaseModel):
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)
    year: int = Field(default=2023, ge=1900)
    fuel_type: str = Field(default="Gasoline", min_length=1)
    transmission: str = Field(default="Automatic", min_length=1)
    description: str | None = None
    image_url: str | None = None

class VehicleUpdate(BaseModel):
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)
    year: int = Field(default=2023, ge=1900)
    fuel_type: str = Field(default="Gasoline", min_length=1)
    transmission: str = Field(default="Automatic", min_length=1)
    description: str | None = None
    image_url: str | None = None

class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    make: str
    model: str
    category: str
    price: float
    quantity: int
    year: int
    fuel_type: str
    transmission: str
    description: str | None
    image_url: str | None
    created_at: datetime
    updated_at: datetime

class VehicleSearchParams(BaseModel):
    make: str | None = None
    model: str | None = None
    category: str | None = None
    min_price: float | None = Field(default=None, gt=0)
    max_price: float | None = Field(default=None, gt=0)
    year: int | None = None
    fuel_type: str | None = None
    transmission: str | None = None

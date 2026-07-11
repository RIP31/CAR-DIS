from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleSearchParams, VehicleUpdate
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

def _get_vehicle_or_404(service: VehicleService, vehicle_id: str) -> Vehicle:
    vehicle = service.get_vehicle(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _current_admin=Depends(get_current_admin),
) -> VehicleResponse:
    vehicle = VehicleService(db).create_vehicle(payload)
    return VehicleResponse.model_validate(vehicle)

@router.get("/search", response_model=list[VehicleResponse])
def search_vehicles(
    make: str | None = Query(default=None),
    model: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_price: float | None = Query(default=None, gt=0),
    max_price: float | None = Query(default=None, gt=0),
    year: int | None = Query(default=None),
    fuel_type: str | None = Query(default=None),
    transmission: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[VehicleResponse]:
    vehicles = VehicleService(db).search_vehicles(
        VehicleSearchParams(
            make=make,
            model=model,
            category=category,
            min_price=min_price,
            max_price=max_price,
            year=year,
            fuel_type=fuel_type,
            transmission=transmission,
        )
    )
    return [VehicleResponse.model_validate(vehicle) for vehicle in vehicles]

@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
    db: Session = Depends(get_db),
) -> list[VehicleResponse]:
    vehicles = VehicleService(db).get_all_vehicles()
    return [VehicleResponse.model_validate(vehicle) for vehicle in vehicles]

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
) -> VehicleResponse:
    vehicle = _get_vehicle_or_404(VehicleService(db), vehicle_id)
    return VehicleResponse.model_validate(vehicle)

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    _current_admin=Depends(get_current_admin),
) -> VehicleResponse:
    service = VehicleService(db)
    vehicle = _get_vehicle_or_404(service, vehicle_id)
    updated = service.update_vehicle(vehicle, payload)
    return VehicleResponse.model_validate(updated)

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    _current_admin=Depends(get_current_admin),
) -> Response:
    service = VehicleService(db)
    vehicle = _get_vehicle_or_404(service, vehicle_id)
    service.delete_vehicle(vehicle)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/{vehicle_id}/purchase", response_model=VehicleResponse)
def purchase_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> VehicleResponse:
    service = VehicleService(db)
    vehicle = _get_vehicle_or_404(service, vehicle_id)
    if vehicle.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vehicle out of stock")
    vehicle.quantity -= 1
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)

@router.post("/{vehicle_id}/restock", response_model=VehicleResponse)
def restock_vehicle(
    vehicle_id: str,
    quantity: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
    _current_admin=Depends(get_current_admin),
) -> VehicleResponse:
    service = VehicleService(db)
    vehicle = _get_vehicle_or_404(service, vehicle_id)
    vehicle.quantity += quantity
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)

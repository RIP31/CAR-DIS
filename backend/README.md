# Car Dealership Inventory System - Backend

## Stack

- FastAPI
- PostgreSQL (Supabase cloud) + SQLAlchemy 2.0
- Alembic
- Pydantic v2
- Pytest + HTTPX
- JWT auth (python-jose + passlib)

## Setup

1. Create virtual environment:
   - `python -m venv .venv`
   - `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (macOS/Linux)
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy env file:
   - `copy .env.example .env`
4. Run app:
   - `python -m uvicorn app.main:app --reload`
5. Run tests:
   - `python -m pytest` or `.venv\Scripts\pytest`
6. Create migration:
   - `python -m alembic revision --autogenerate -m "migration name"`
7. Apply migrations:
   - `python -m alembic upgrade head`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login & token generation
- `GET /api/auth/me` - Get current authenticated user details

### Vehicles & Inventory
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/search` - Search and filter vehicles (make, model, year, category, price, fuel, transmission)
- `GET /api/vehicles/{vehicle_id}` - View vehicle details
- `POST /api/vehicles` - Create new vehicle (Admin only)
- `PUT /api/vehicles/{vehicle_id}` - Update vehicle details (Admin only)
- `DELETE /api/vehicles/{vehicle_id}` - Delete vehicle (Admin only)
- `POST /api/vehicles/{vehicle_id}/restock` - Add stock to vehicle (Admin only)

### Purchase & Reservations
- `POST /api/purchases` - Securely reserve vehicle stock and log transaction
- `GET /api/purchases/my-purchases` - Fetch purchase history of current user
- `GET /api/purchases/{purchase_id}` - Fetch single purchase details
- `GET /api/admin/purchases` - View global transactional database (Admin only)
- `PATCH /api/admin/purchases/{purchase_id}/status` - Transition purchase order state (Admin only)

### Wishlist System
- `GET /api/wishlist` - View user's wishlist
- `POST /api/wishlist/{vehicle_id}` - Toggle wishlisted vehicle status

### Lead Callback Management
- `POST /api/callbacks` - Submit callback request

Swagger docs:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

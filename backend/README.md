# Car Dealership Inventory System - Backend

## Environment

```text
Current time: 2026-07-11T10:45:25+05:30
Working directory: D:\ridham\DDU\Incubyte\Project\CAR-DIS\backend
Workspace root folder: D:\ridham\DDU\Incubyte\Project
AI / Editor: Kilo (kilo.ai)
```

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
   - `.venv\Scripts\activate`
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy env file:
   - `copy .env.example .env`
4. Run app:
   - `python -m uvicorn app.main:app --reload`
5. Run tests:
   - `python -m pytest`
6. Create migration:
   - `python -m alembic revision --autogenerate -m "initial schema"`
7. Apply migrations:
   - `python -m alembic upgrade head`

## API Endpoints

- `GET /`
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/admin-only`
- `POST /api/vehicles`
- `GET /api/vehicles`
- `GET /api/vehicles/search`
- `GET /api/vehicles/{vehicle_id}`
- `PUT /api/vehicles/{vehicle_id}`
- `DELETE /api/vehicles/{vehicle_id}`
- `POST /api/vehicles/{vehicle_id}/purchase`
- `POST /api/vehicles/{vehicle_id}/restock`

Swagger docs:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.vehicles import router as vehicles_router
from app.api.purchases import router as purchases_router
from app.api.wishlist import router as wishlist_router
from app.api.callbacks import router as callbacks_router
from app.api.notifications import router as notifications_router
from app.core.database import Base, engine
from app.core.settings import get_settings
from app.core.exceptions import http_exception_handler, unhandled_exception_handler

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.app_debug,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(auth_router)
app.include_router(vehicles_router)
app.include_router(purchases_router)
app.include_router(wishlist_router)
app.include_router(callbacks_router)
app.include_router(notifications_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Car Dealership Inventory System API"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

from app.api.auth import router as auth_router
from app.api.vehicles import router as vehicles_router
from app.api.purchases import router as purchases_router
from app.api.wishlist import router as wishlist_router
from app.api.callbacks import router as callbacks_router

__all__ = [
    "auth_router",
    "vehicles_router",
    "purchases_router",
    "wishlist_router",
    "callbacks_router",
]

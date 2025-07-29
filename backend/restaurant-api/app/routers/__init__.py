from .auth import router as auth_router
from .restaurants import router as restaurants_router
from .menus import router as menus_router
from .orders import router as orders_router
from .cms import router as cms_router
from .pos import router as pos_router

__all__ = [
    "auth_router",
    "restaurants_router", 
    "menus_router",
    "orders_router",
    "cms_router",
    "pos_router"
]

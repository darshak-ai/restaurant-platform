from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import (
    auth_router,
    restaurants_router,
    menus_router,
    orders_router,
    cms_router,
    pos_router
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Restaurant Platform API",
    description="A comprehensive restaurant ordering platform API with POS integration",
    version="1.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth_router)
app.include_router(restaurants_router)
app.include_router(menus_router)
app.include_router(orders_router)
app.include_router(cms_router)
app.include_router(pos_router)

@app.get("/")
async def root():
    return {
        "message": "Restaurant Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/healthz"
    }

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

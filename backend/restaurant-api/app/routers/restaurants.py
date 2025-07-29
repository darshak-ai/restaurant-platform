from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.restaurant import RestaurantCreate, RestaurantResponse, RestaurantUpdate, RestaurantLocation
from app.services.restaurant_service import RestaurantService
from app.utils.dependencies import get_current_admin_user, get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

@router.post("/", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new restaurant (Admin only)"""
    restaurant_service = RestaurantService(db)
    return restaurant_service.create_restaurant(restaurant_data)

@router.get("/", response_model=List[RestaurantResponse])
async def get_restaurants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get all restaurants"""
    restaurant_service = RestaurantService(db)
    return restaurant_service.get_restaurants(skip=skip, limit=limit, active_only=active_only)

@router.get("/nearby", response_model=List[RestaurantLocation])
async def get_nearby_restaurants(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Find nearby restaurants based on user location"""
    restaurant_service = RestaurantService(db)
    return restaurant_service.find_nearest_restaurants(latitude, longitude, limit)

@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    """Get restaurant by ID"""
    restaurant_service = RestaurantService(db)
    restaurant = restaurant_service.get_restaurant(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    return restaurant

@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update restaurant (Admin only)"""
    restaurant_service = RestaurantService(db)
    restaurant = restaurant_service.update_restaurant(restaurant_id, restaurant_data)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    return restaurant

@router.delete("/{restaurant_id}")
async def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete restaurant (Admin only)"""
    restaurant_service = RestaurantService(db)
    success = restaurant_service.delete_restaurant(restaurant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    return {"message": "Restaurant deleted successfully"}

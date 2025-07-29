from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.pos_service import POSService
from app.services.restaurant_service import RestaurantService
from app.services.menu_service import MenuService
from app.utils.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/pos", tags=["POS integration"])

@router.post("/toast/sync-restaurants")
async def sync_toast_restaurants(
    access_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Sync restaurants from Toast POS (Admin only)"""
    pos_service = POSService()
    restaurant_service = RestaurantService(db)
    
    try:
        toast_restaurants = pos_service.sync_toast_restaurants(access_token)
        
        synced_count = 0
        for toast_restaurant in toast_restaurants:
            existing = restaurant_service.get_restaurant_by_location_id(
                toast_location_id=toast_restaurant.get('guid')
            )
            
            if not existing:
                restaurant_data = {
                    "name": toast_restaurant.get('restaurantName', ''),
                    "address": toast_restaurant.get('address', {}).get('address1', ''),
                    "city": toast_restaurant.get('address', {}).get('city', ''),
                    "state": toast_restaurant.get('address', {}).get('stateCode', ''),
                    "zip_code": toast_restaurant.get('address', {}).get('zipCode', ''),
                    "phone_number": toast_restaurant.get('phone', ''),
                    "toast_location_id": toast_restaurant.get('guid')
                }
                synced_count += 1
        
        return {
            "message": f"Successfully synced {synced_count} restaurants from Toast",
            "synced_count": synced_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Toast restaurants: {str(e)}"
        )

@router.post("/toast/sync-menu/{restaurant_id}")
async def sync_toast_menu(
    restaurant_id: int,
    access_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Sync menu from Toast POS for a specific restaurant (Admin only)"""
    pos_service = POSService()
    restaurant_service = RestaurantService(db)
    menu_service = MenuService(db)
    
    restaurant = restaurant_service.get_restaurant(restaurant_id)
    if not restaurant or not restaurant.toast_location_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or not linked to Toast"
        )
    
    try:
        toast_menu = pos_service.sync_toast_menu(access_token, restaurant.toast_location_id)
        
        
        return {
            "message": f"Successfully synced menu for restaurant {restaurant.name}",
            "restaurant_id": restaurant_id,
            "toast_location_id": restaurant.toast_location_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Toast menu: {str(e)}"
        )

@router.post("/clover/sync-merchant/{restaurant_id}")
async def sync_clover_merchant(
    restaurant_id: int,
    access_token: str,
    merchant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Sync merchant info from Clover POS (Admin only)"""
    pos_service = POSService()
    restaurant_service = RestaurantService(db)
    
    restaurant = restaurant_service.get_restaurant(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    try:
        clover_merchant = pos_service.sync_clover_merchant(access_token, merchant_id)
        
        restaurant.clover_merchant_id = merchant_id
        db.commit()
        
        return {
            "message": f"Successfully synced Clover merchant for restaurant {restaurant.name}",
            "restaurant_id": restaurant_id,
            "merchant_id": merchant_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Clover merchant: {str(e)}"
        )

@router.post("/clover/sync-inventory/{restaurant_id}")
async def sync_clover_inventory(
    restaurant_id: int,
    access_token: str,
    merchant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Sync inventory/menu from Clover POS (Admin only)"""
    pos_service = POSService()
    restaurant_service = RestaurantService(db)
    
    restaurant = restaurant_service.get_restaurant(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    try:
        clover_items = pos_service.sync_clover_inventory(access_token, merchant_id)
        
        
        return {
            "message": f"Successfully synced inventory for restaurant {restaurant.name}",
            "restaurant_id": restaurant_id,
            "merchant_id": merchant_id,
            "items_count": len(clover_items)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync Clover inventory: {str(e)}"
        )

@router.post("/toast/submit-order")
async def submit_order_to_toast(
    order_data: Dict[str, Any],
    access_token: str,
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Submit order to Toast POS (Admin only)"""
    pos_service = POSService()
    
    try:
        toast_order_id = pos_service.submit_toast_order(access_token, restaurant_id, order_data)
        
        if toast_order_id:
            return {
                "message": "Order successfully submitted to Toast",
                "toast_order_id": toast_order_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit order to Toast"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit order to Toast: {str(e)}"
        )

@router.post("/clover/submit-order")
async def submit_order_to_clover(
    order_data: Dict[str, Any],
    access_token: str,
    merchant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Submit order to Clover POS (Admin only)"""
    pos_service = POSService()
    
    try:
        clover_order_id = pos_service.submit_clover_order(access_token, merchant_id, order_data)
        
        if clover_order_id:
            return {
                "message": "Order successfully submitted to Clover",
                "clover_order_id": clover_order_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit order to Clover"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit order to Clover: {str(e)}"
        )

@router.get("/status")
async def get_pos_integration_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get POS integration status (Admin only)"""
    restaurant_service = RestaurantService(db)
    restaurants = restaurant_service.get_restaurants()
    
    toast_connected = sum(1 for r in restaurants if r.toast_location_id)
    clover_connected = sum(1 for r in restaurants if r.clover_merchant_id)
    
    return {
        "total_restaurants": len(restaurants),
        "toast_connected": toast_connected,
        "clover_connected": clover_connected,
        "integration_status": {
            "toast": toast_connected > 0,
            "clover": clover_connected > 0
        }
    }

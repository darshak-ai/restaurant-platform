from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.menu import (
    MenuCreate, MenuResponse, MenuUpdate, MenuWithItems,
    MenuItemCreate, MenuItemResponse, MenuItemUpdate,
    MenuCategoryCreate, MenuCategoryResponse, MenuCategoryUpdate
)
from app.services.menu_service import MenuService
from app.utils.dependencies import get_current_admin_user, get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/menus", tags=["menus"])

@router.post("/", response_model=MenuResponse)
async def create_menu(
    menu_data: MenuCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new menu (Admin only)"""
    menu_service = MenuService(db)
    return menu_service.create_menu(menu_data)

@router.get("/restaurant/{restaurant_id}", response_model=List[MenuResponse])
async def get_restaurant_menus(
    restaurant_id: int,
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get all menus for a restaurant"""
    menu_service = MenuService(db)
    return menu_service.get_restaurant_menus(restaurant_id, active_only)

@router.get("/{menu_id}", response_model=MenuWithItems)
async def get_menu_with_items(
    menu_id: int,
    db: Session = Depends(get_db)
):
    """Get menu with all items and categories"""
    menu_service = MenuService(db)
    menu = menu_service.get_menu(menu_id)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    categories = menu_service.get_menu_categories(menu_id)
    items = menu_service.get_menu_items(menu_id)
    
    menu_dict = menu.__dict__.copy()
    menu_dict['categories'] = categories
    menu_dict['items'] = items
    
    return menu_dict

@router.put("/{menu_id}", response_model=MenuResponse)
async def update_menu(
    menu_id: int,
    menu_data: MenuUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update menu (Admin only)"""
    menu_service = MenuService(db)
    menu = menu_service.update_menu(menu_id, menu_data)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    return menu

@router.delete("/{menu_id}")
async def delete_menu(
    menu_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete menu (Admin only)"""
    menu_service = MenuService(db)
    success = menu_service.delete_menu(menu_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    return {"message": "Menu deleted successfully"}

@router.post("/categories", response_model=MenuCategoryResponse)
async def create_menu_category(
    category_data: MenuCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new menu category (Admin only)"""
    menu_service = MenuService(db)
    return menu_service.create_menu_category(category_data)

@router.get("/{menu_id}/categories", response_model=List[MenuCategoryResponse])
async def get_menu_categories(
    menu_id: int,
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get all categories for a menu"""
    menu_service = MenuService(db)
    return menu_service.get_menu_categories(menu_id, active_only)

@router.put("/categories/{category_id}", response_model=MenuCategoryResponse)
async def update_menu_category(
    category_id: int,
    category_data: MenuCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update menu category (Admin only)"""
    menu_service = MenuService(db)
    category = menu_service.update_menu_category(category_id, category_data)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu category not found"
        )
    return category

@router.delete("/categories/{category_id}")
async def delete_menu_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete menu category (Admin only)"""
    menu_service = MenuService(db)
    success = menu_service.delete_menu_category(category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu category not found"
        )
    return {"message": "Menu category deleted successfully"}

@router.post("/items", response_model=MenuItemResponse)
async def create_menu_item(
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new menu item (Admin only)"""
    menu_service = MenuService(db)
    return menu_service.create_menu_item(item_data)

@router.get("/{menu_id}/items", response_model=List[MenuItemResponse])
async def get_menu_items(
    menu_id: int,
    category_id: Optional[int] = Query(None),
    available_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get all items for a menu"""
    menu_service = MenuService(db)
    return menu_service.get_menu_items(menu_id, category_id, available_only)

@router.get("/items/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Get menu item by ID"""
    menu_service = MenuService(db)
    item = menu_service.get_menu_item(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    return item

@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: int,
    item_data: MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update menu item (Admin only)"""
    menu_service = MenuService(db)
    item = menu_service.update_menu_item(item_id, item_data)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    return item

@router.delete("/items/{item_id}")
async def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete menu item (Admin only)"""
    menu_service = MenuService(db)
    success = menu_service.delete_menu_item(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    return {"message": "Menu item deleted successfully"}

@router.get("/restaurant/{restaurant_id}/featured", response_model=List[MenuItemResponse])
async def get_featured_items(
    restaurant_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured menu items for a restaurant"""
    menu_service = MenuService(db)
    return menu_service.get_featured_items(restaurant_id, limit)

@router.get("/restaurant/{restaurant_id}/search", response_model=List[MenuItemResponse])
async def search_menu_items(
    restaurant_id: int,
    q: str = Query(..., description="Search term"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search menu items by name or description"""
    menu_service = MenuService(db)
    return menu_service.search_menu_items(restaurant_id, q, limit)

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.menu import Menu, MenuItem, MenuCategory, MenuStatus
from app.models.restaurant import Restaurant
from app.schemas.menu import MenuCreate, MenuUpdate, MenuItemCreate, MenuItemUpdate, MenuCategoryCreate, MenuCategoryUpdate
from fastapi import HTTPException, status
import json

class MenuService:
    def __init__(self, db: Session):
        self.db = db

    def create_menu(self, menu_data: MenuCreate) -> Menu:
        restaurant = self.db.query(Restaurant).filter(Restaurant.id == menu_data.restaurant_id).first()
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )

        db_menu = Menu(
            restaurant_id=menu_data.restaurant_id,
            name=menu_data.name,
            description=menu_data.description,
            is_default=menu_data.is_default
        )
        
        self.db.add(db_menu)
        self.db.commit()
        self.db.refresh(db_menu)
        return db_menu

    def get_menu(self, menu_id: int) -> Optional[Menu]:
        return self.db.query(Menu).filter(Menu.id == menu_id).first()

    def get_restaurant_menus(self, restaurant_id: int, active_only: bool = True) -> List[Menu]:
        query = self.db.query(Menu).filter(Menu.restaurant_id == restaurant_id)
        if active_only:
            query = query.filter(Menu.status == MenuStatus.ACTIVE)
        return query.all()

    def update_menu(self, menu_id: int, menu_data: MenuUpdate) -> Optional[Menu]:
        db_menu = self.get_menu(menu_id)
        if not db_menu:
            return None

        update_data = menu_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_menu, field, value)

        self.db.commit()
        self.db.refresh(db_menu)
        return db_menu

    def delete_menu(self, menu_id: int) -> bool:
        db_menu = self.get_menu(menu_id)
        if not db_menu:
            return False

        self.db.delete(db_menu)
        self.db.commit()
        return True

    def create_menu_category(self, category_data: MenuCategoryCreate) -> MenuCategory:
        menu = self.get_menu(category_data.menu_id)
        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found"
            )

        db_category = MenuCategory(
            menu_id=category_data.menu_id,
            name=category_data.name,
            description=category_data.description,
            display_order=category_data.display_order,
            image_url=category_data.image_url
        )
        
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def get_menu_category(self, category_id: int) -> Optional[MenuCategory]:
        return self.db.query(MenuCategory).filter(MenuCategory.id == category_id).first()

    def get_menu_categories(self, menu_id: int, active_only: bool = True) -> List[MenuCategory]:
        query = self.db.query(MenuCategory).filter(MenuCategory.menu_id == menu_id)
        if active_only:
            query = query.filter(MenuCategory.is_active == True)
        return query.order_by(MenuCategory.display_order).all()

    def update_menu_category(self, category_id: int, category_data: MenuCategoryUpdate) -> Optional[MenuCategory]:
        db_category = self.get_menu_category(category_id)
        if not db_category:
            return None

        update_data = category_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)

        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def delete_menu_category(self, category_id: int) -> bool:
        db_category = self.get_menu_category(category_id)
        if not db_category:
            return False

        self.db.delete(db_category)
        self.db.commit()
        return True

    def create_menu_item(self, item_data: MenuItemCreate) -> MenuItem:
        menu = self.get_menu(item_data.menu_id)
        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found"
            )

        if item_data.category_id:
            category = self.get_menu_category(item_data.category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Menu category not found"
                )

        ingredients_json = json.dumps(item_data.ingredients) if item_data.ingredients else None
        allergens_json = json.dumps(item_data.allergens) if item_data.allergens else None
        dietary_info_json = json.dumps(item_data.dietary_info) if item_data.dietary_info else None
        images_json = json.dumps(item_data.images) if item_data.images else None
        modifiers_json = json.dumps(item_data.modifiers) if item_data.modifiers else None

        db_item = MenuItem(
            menu_id=item_data.menu_id,
            category_id=item_data.category_id,
            name=item_data.name,
            description=item_data.description,
            price=item_data.price,
            calories=item_data.calories,
            ingredients=ingredients_json,
            allergens=allergens_json,
            dietary_info=dietary_info_json,
            image_url=item_data.image_url,
            images=images_json,
            display_order=item_data.display_order,
            modifiers=modifiers_json
        )
        
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_menu_item(self, item_id: int) -> Optional[MenuItem]:
        return self.db.query(MenuItem).filter(MenuItem.id == item_id).first()

    def get_menu_items(self, menu_id: int, category_id: Optional[int] = None, available_only: bool = True) -> List[MenuItem]:
        query = self.db.query(MenuItem).filter(MenuItem.menu_id == menu_id)
        
        if category_id:
            query = query.filter(MenuItem.category_id == category_id)
        
        if available_only:
            query = query.filter(MenuItem.is_available == True)
        
        return query.order_by(MenuItem.display_order).all()

    def update_menu_item(self, item_id: int, item_data: MenuItemUpdate) -> Optional[MenuItem]:
        db_item = self.get_menu_item(item_id)
        if not db_item:
            return None

        update_data = item_data.dict(exclude_unset=True)
        
        if 'ingredients' in update_data and update_data['ingredients'] is not None:
            update_data['ingredients'] = json.dumps(update_data['ingredients'])
        if 'allergens' in update_data and update_data['allergens'] is not None:
            update_data['allergens'] = json.dumps(update_data['allergens'])
        if 'dietary_info' in update_data and update_data['dietary_info'] is not None:
            update_data['dietary_info'] = json.dumps(update_data['dietary_info'])
        if 'images' in update_data and update_data['images'] is not None:
            update_data['images'] = json.dumps(update_data['images'])
        if 'modifiers' in update_data and update_data['modifiers'] is not None:
            update_data['modifiers'] = json.dumps(update_data['modifiers'])

        for field, value in update_data.items():
            setattr(db_item, field, value)

        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete_menu_item(self, item_id: int) -> bool:
        db_item = self.get_menu_item(item_id)
        if not db_item:
            return False

        self.db.delete(db_item)
        self.db.commit()
        return True

    def get_featured_items(self, restaurant_id: int, limit: int = 10) -> List[MenuItem]:
        """Get featured menu items for a restaurant"""
        return self.db.query(MenuItem).join(Menu).filter(
            Menu.restaurant_id == restaurant_id,
            MenuItem.is_featured == True,
            MenuItem.is_available == True
        ).order_by(MenuItem.display_order).limit(limit).all()

    def search_menu_items(self, restaurant_id: int, search_term: str, limit: int = 20) -> List[MenuItem]:
        """Search menu items by name or description"""
        search_pattern = f"%{search_term}%"
        return self.db.query(MenuItem).join(Menu).filter(
            Menu.restaurant_id == restaurant_id,
            MenuItem.is_available == True,
            (MenuItem.name.ilike(search_pattern) | MenuItem.description.ilike(search_pattern))
        ).order_by(MenuItem.name).limit(limit).all()

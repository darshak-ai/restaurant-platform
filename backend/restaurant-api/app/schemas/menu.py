from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.menu import MenuStatus
import json

class MenuCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: int = 0
    image_url: Optional[str] = None

class MenuCategoryCreate(MenuCategoryBase):
    menu_id: int

class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None

class MenuCategoryResponse(MenuCategoryBase):
    id: int
    menu_id: int
    is_active: bool
    toast_category_id: Optional[str] = None
    clover_category_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    calories: Optional[int] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    dietary_info: Optional[List[str]] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None

class MenuItemCreate(MenuItemBase):
    menu_id: int
    category_id: Optional[int] = None
    display_order: int = 0
    modifiers: Optional[Dict[str, Any]] = None

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    calories: Optional[int] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    dietary_info: Optional[List[str]] = None
    is_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    modifiers: Optional[Dict[str, Any]] = None

class MenuItemResponse(MenuItemBase):
    id: int
    menu_id: int
    category_id: Optional[int] = None
    is_available: bool
    is_featured: bool
    display_order: int
    modifiers: Optional[Dict[str, Any]] = None
    toast_item_id: Optional[str] = None
    clover_item_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('ingredients', mode='before')
    @classmethod
    def parse_ingredients(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    @field_validator('allergens', mode='before')
    @classmethod
    def parse_allergens(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    @field_validator('dietary_info', mode='before')
    @classmethod
    def parse_dietary_info(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    @field_validator('images', mode='before')
    @classmethod
    def parse_images(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    @field_validator('modifiers', mode='before')
    @classmethod
    def parse_modifiers(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    class Config:
        from_attributes = True

class MenuBase(BaseModel):
    name: str
    description: Optional[str] = None

class MenuCreate(MenuBase):
    restaurant_id: int
    is_default: bool = False

class MenuUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[MenuStatus] = None
    is_default: Optional[bool] = None

class MenuResponse(MenuBase):
    id: int
    restaurant_id: int
    status: MenuStatus
    is_default: bool
    toast_menu_id: Optional[str] = None
    clover_menu_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    categories: Optional[List[MenuCategoryResponse]] = None
    items: Optional[List[MenuItemResponse]] = None

    class Config:
        from_attributes = True

class MenuWithItems(MenuResponse):
    categories: List[MenuCategoryResponse] = []
    items: List[MenuItemResponse] = []

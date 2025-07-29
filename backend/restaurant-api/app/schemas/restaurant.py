from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
import json

class RestaurantBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    country: str = "US"
    phone_number: str
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    opening_hours: Optional[Dict[str, Any]] = None

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None
    is_open: Optional[bool] = None
    opening_hours: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None

class RestaurantResponse(RestaurantBase):
    id: int
    is_active: bool
    is_open: bool
    opening_hours: Optional[Dict[str, Any]] = None
    toast_location_id: Optional[str] = None
    clover_merchant_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('opening_hours', mode='before')
    @classmethod
    def parse_opening_hours(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    class Config:
        from_attributes = True

class RestaurantLocation(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone_number: str
    is_open: bool
    distance: Optional[float] = None  # Distance from user location in miles

    class Config:
        from_attributes = True

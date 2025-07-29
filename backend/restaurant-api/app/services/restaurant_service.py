from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate, RestaurantLocation
from fastapi import HTTPException, status
import json
import math

class RestaurantService:
    def __init__(self, db: Session):
        self.db = db

    def create_restaurant(self, restaurant_data: RestaurantCreate) -> Restaurant:
        opening_hours_json = None
        if restaurant_data.opening_hours:
            opening_hours_json = json.dumps(restaurant_data.opening_hours)

        db_restaurant = Restaurant(
            name=restaurant_data.name,
            address=restaurant_data.address,
            city=restaurant_data.city,
            state=restaurant_data.state,
            zip_code=restaurant_data.zip_code,
            country=restaurant_data.country,
            phone_number=restaurant_data.phone_number,
            email=restaurant_data.email,
            latitude=restaurant_data.latitude,
            longitude=restaurant_data.longitude,
            description=restaurant_data.description,
            website=restaurant_data.website,
            image_url=restaurant_data.image_url,
            opening_hours=opening_hours_json
        )
        
        self.db.add(db_restaurant)
        self.db.commit()
        self.db.refresh(db_restaurant)
        return db_restaurant

    def get_restaurant(self, restaurant_id: int) -> Optional[Restaurant]:
        return self.db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    def get_restaurants(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Restaurant]:
        query = self.db.query(Restaurant)
        if active_only:
            query = query.filter(Restaurant.is_active == True)
        return query.offset(skip).limit(limit).all()

    def update_restaurant(self, restaurant_id: int, restaurant_data: RestaurantUpdate) -> Optional[Restaurant]:
        db_restaurant = self.get_restaurant(restaurant_id)
        if not db_restaurant:
            return None

        update_data = restaurant_data.dict(exclude_unset=True)
        
        if 'opening_hours' in update_data and update_data['opening_hours'] is not None:
            update_data['opening_hours'] = json.dumps(update_data['opening_hours'])

        for field, value in update_data.items():
            setattr(db_restaurant, field, value)

        self.db.commit()
        self.db.refresh(db_restaurant)
        return db_restaurant

    def delete_restaurant(self, restaurant_id: int) -> bool:
        db_restaurant = self.get_restaurant(restaurant_id)
        if not db_restaurant:
            return False

        db_restaurant.is_active = False
        self.db.commit()
        return True

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula (in miles)"""
        R = 3959  # Earth's radius in miles

        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)

        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad

        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance = R * c

        return distance

    def find_nearest_restaurants(self, user_lat: float, user_lon: float, limit: int = 10) -> List[RestaurantLocation]:
        """Find nearest restaurants to user location"""
        restaurants = self.db.query(Restaurant).filter(
            Restaurant.is_active == True,
            Restaurant.latitude.isnot(None),
            Restaurant.longitude.isnot(None)
        ).all()

        restaurant_locations = []
        for restaurant in restaurants:
            distance = self.calculate_distance(user_lat, user_lon, restaurant.latitude, restaurant.longitude)
            
            location = RestaurantLocation(
                id=restaurant.id,
                name=restaurant.name,
                address=restaurant.address,
                city=restaurant.city,
                state=restaurant.state,
                latitude=restaurant.latitude,
                longitude=restaurant.longitude,
                phone_number=restaurant.phone_number,
                is_open=restaurant.is_open,
                distance=distance
            )
            restaurant_locations.append(location)

        restaurant_locations.sort(key=lambda x: x.distance)
        return restaurant_locations[:limit]

    def get_restaurant_by_location_id(self, toast_location_id: Optional[str] = None, clover_merchant_id: Optional[str] = None) -> Optional[Restaurant]:
        """Get restaurant by POS location ID"""
        query = self.db.query(Restaurant)
        
        if toast_location_id:
            query = query.filter(Restaurant.toast_location_id == toast_location_id)
        elif clover_merchant_id:
            query = query.filter(Restaurant.clover_merchant_id == clover_merchant_id)
        else:
            return None
            
        return query.first()

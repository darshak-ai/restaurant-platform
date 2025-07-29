from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, default="US")
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=True)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_open = Column(Boolean, default=True)
    opening_hours = Column(Text, nullable=True)  # JSON string
    
    toast_location_id = Column(String, nullable=True)
    clover_merchant_id = Column(String, nullable=True)
    
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    menus = relationship("Menu", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")

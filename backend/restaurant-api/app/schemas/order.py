from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.order import OrderType, OrderStatus, PaymentStatus

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int = 1
    modifiers: Optional[Dict[str, Any]] = None
    special_instructions: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    unit_price: float
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    restaurant_id: int
    order_type: OrderType
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    special_instructions: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

    @validator('items')
    def validate_items(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Order must contain at least one item')
        return v

    @validator('customer_phone')
    def validate_phone(cls, v):
        if not v or len(v.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')) < 10:
            raise ValueError('Valid phone number is required')
        return v

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    estimated_ready_time: Optional[datetime] = None
    actual_ready_time: Optional[datetime] = None
    payment_status: Optional[PaymentStatus] = None

class OrderResponse(OrderBase):
    id: int
    order_number: str
    status: OrderStatus
    subtotal: float
    tax_amount: float
    tip_amount: float
    total_amount: float
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    estimated_ready_time: Optional[datetime] = None
    actual_ready_time: Optional[datetime] = None
    otp_verified: bool
    toast_order_id: Optional[str] = None
    clover_order_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerification(BaseModel):
    phone_number: str
    otp_code: str

class OrderSummary(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    order_type: OrderType
    status: OrderStatus
    total_amount: float
    payment_status: PaymentStatus
    estimated_ready_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

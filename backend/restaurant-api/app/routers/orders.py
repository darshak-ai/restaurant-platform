from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderUpdate, OrderSummary,
    OTPRequest, OTPVerification
)
from app.services.order_service import OrderService
from app.utils.dependencies import get_current_admin_user, get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    """Create a new order"""
    order_service = OrderService(db)
    return order_service.create_order(order_data)

@router.post("/{order_id}/verify-otp")
async def verify_order_otp(
    order_id: int,
    otp_data: OTPVerification,
    db: Session = Depends(get_db)
):
    """Verify OTP for order"""
    order_service = OrderService(db)
    
    order = order_service.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.customer_phone != otp_data.phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number does not match order"
        )
    
    success = order_service.verify_otp(order_id, otp_data.otp_code)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    return {"message": "OTP verified successfully", "verified": True}

@router.get("/", response_model=List[OrderSummary])
async def get_orders(
    restaurant_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all orders (Admin only)"""
    order_service = OrderService(db)
    orders = order_service.get_orders(restaurant_id, skip, limit)
    
    return [
        OrderSummary(
            id=order.id,
            order_number=order.order_number,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            order_type=order.order_type,
            status=order.status,
            total_amount=order.total_amount,
            payment_status=order.payment_status,
            estimated_ready_time=order.estimated_ready_time,
            created_at=order.created_at
        ) for order in orders
    ]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get order by ID"""
    order_service = OrderService(db)
    order = order_service.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if current_user is None and not order.otp_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Order not verified"
        )
    
    return order

@router.get("/number/{order_number}", response_model=OrderResponse)
async def get_order_by_number(
    order_number: str,
    db: Session = Depends(get_db)
):
    """Get order by order number (for customer lookup)"""
    order_service = OrderService(db)
    order = order_service.get_order_by_number(order_number)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update order status (Admin only)"""
    order_service = OrderService(db)
    order = order_service.update_order(order_id, order_data)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@router.delete("/{order_id}")
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Cancel order (Admin only)"""
    order_service = OrderService(db)
    success = order_service.cancel_order(order_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return {"message": "Order cancelled successfully"}

@router.get("/restaurant/{restaurant_id}/status/{status}", response_model=List[OrderSummary])
async def get_orders_by_status(
    restaurant_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get orders by status for a restaurant (Admin only)"""
    order_service = OrderService(db)
    orders = order_service.get_orders_by_status(restaurant_id, status)
    
    return [
        OrderSummary(
            id=order.id,
            order_number=order.order_number,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            order_type=order.order_type,
            status=order.status,
            total_amount=order.total_amount,
            payment_status=order.payment_status,
            estimated_ready_time=order.estimated_ready_time,
            created_at=order.created_at
        ) for order in orders
    ]

@router.get("/restaurant/{restaurant_id}/analytics")
async def get_order_analytics(
    restaurant_id: int,
    start_date: datetime = Query(..., description="Start date for analytics"),
    end_date: datetime = Query(..., description="End date for analytics"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get order analytics for a restaurant (Admin only)"""
    order_service = OrderService(db)
    return order_service.get_order_analytics(restaurant_id, start_date, end_date)

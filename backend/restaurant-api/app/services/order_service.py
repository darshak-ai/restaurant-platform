from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from app.models.restaurant import Restaurant
from app.schemas.order import OrderCreate, OrderUpdate, OrderItemCreate
from app.services.sms_service import SMSService
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import uuid
import random
import string

class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.sms_service = SMSService()

    def generate_order_number(self) -> str:
        """Generate a unique order number"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_suffix = ''.join(random.choices(string.digits, k=4))
        return f"ORD-{timestamp}-{random_suffix}"

    def calculate_order_totals(self, items: List[OrderItemCreate]) -> Dict[str, float]:
        """Calculate order subtotal, tax, and total"""
        subtotal = 0.0
        
        for item_data in items:
            menu_item = self.db.query(MenuItem).filter(MenuItem.id == item_data.menu_item_id).first()
            if not menu_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Menu item with id {item_data.menu_item_id} not found"
                )
            
            if not menu_item.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Menu item '{menu_item.name}' is not available"
                )
            
            item_total = menu_item.price * item_data.quantity
            subtotal += item_total

        tax_rate = 0.085
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount

        return {
            "subtotal": round(subtotal, 2),
            "tax_amount": round(tax_amount, 2),
            "total_amount": round(total_amount, 2)
        }

    def create_order(self, order_data: OrderCreate) -> Order:
        restaurant = self.db.query(Restaurant).filter(Restaurant.id == order_data.restaurant_id).first()
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )

        if not restaurant.is_active or not restaurant.is_open:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant is currently closed"
            )

        totals = self.calculate_order_totals(order_data.items)

        otp_code = self.sms_service.generate_otp()
        otp_expires_at = datetime.utcnow() + timedelta(minutes=10)

        db_order = Order(
            restaurant_id=order_data.restaurant_id,
            order_number=self.generate_order_number(),
            order_type=order_data.order_type,
            customer_name=order_data.customer_name,
            customer_phone=order_data.customer_phone,
            customer_email=order_data.customer_email,
            special_instructions=order_data.special_instructions,
            subtotal=totals["subtotal"],
            tax_amount=totals["tax_amount"],
            total_amount=totals["total_amount"],
            otp_code=otp_code,
            otp_expires_at=otp_expires_at
        )

        self.db.add(db_order)
        self.db.flush()  # Get the order ID

        for item_data in order_data.items:
            menu_item = self.db.query(MenuItem).filter(MenuItem.id == item_data.menu_item_id).first()
            
            item_total = menu_item.price * item_data.quantity
            
            db_order_item = OrderItem(
                order_id=db_order.id,
                menu_item_id=item_data.menu_item_id,
                quantity=item_data.quantity,
                unit_price=menu_item.price,
                total_price=item_total,
                modifiers=item_data.modifiers,
                special_instructions=item_data.special_instructions
            )
            self.db.add(db_order_item)

        self.db.commit()
        self.db.refresh(db_order)

        self.sms_service.send_otp(order_data.customer_phone, otp_code)

        return db_order

    def verify_otp(self, order_id: int, otp_code: str) -> bool:
        """Verify OTP for order"""
        order = self.get_order(order_id)
        if not order:
            return False

        if order.otp_verified:
            return True

        if order.otp_code != otp_code:
            return False

        if order.otp_expires_at and datetime.utcnow() > order.otp_expires_at:
            return False

        order.otp_verified = True
        self.db.commit()

        restaurant = self.db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
        if restaurant:
            self.sms_service.send_order_confirmation(
                order.customer_phone, 
                order.order_number, 
                restaurant.name
            )

        return True

    def get_order(self, order_id: int) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_order_by_number(self, order_number: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.order_number == order_number).first()

    def get_orders(self, restaurant_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[Order]:
        query = self.db.query(Order)
        if restaurant_id:
            query = query.filter(Order.restaurant_id == restaurant_id)
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def update_order(self, order_id: int, order_data: OrderUpdate) -> Optional[Order]:
        db_order = self.get_order(order_id)
        if not db_order:
            return None

        update_data = order_data.dict(exclude_unset=True)
        
        old_status = db_order.status
        for field, value in update_data.items():
            setattr(db_order, field, value)

        if 'status' in update_data and update_data['status'] != old_status:
            if update_data['status'] == 'ready':
                self.sms_service.send_order_ready_notification(
                    db_order.customer_phone,
                    db_order.order_number
                )

        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def cancel_order(self, order_id: int) -> bool:
        """Cancel an order"""
        db_order = self.get_order(order_id)
        if not db_order:
            return False

        if db_order.status in ['completed', 'cancelled']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel order in current status"
            )

        db_order.status = 'cancelled'
        self.db.commit()
        return True

    def get_orders_by_status(self, restaurant_id: int, status: str) -> List[Order]:
        """Get orders by status for a restaurant"""
        return self.db.query(Order).filter(
            Order.restaurant_id == restaurant_id,
            Order.status == status
        ).order_by(Order.created_at.desc()).all()

    def get_order_analytics(self, restaurant_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get order analytics for a restaurant"""
        orders = self.db.query(Order).filter(
            Order.restaurant_id == restaurant_id,
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status != 'cancelled'
        ).all()

        total_orders = len(orders)
        total_revenue = sum(order.total_amount for order in orders)
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

        order_types = {}
        for order in orders:
            order_type = order.order_type.value
            order_types[order_type] = order_types.get(order_type, 0) + 1

        return {
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "average_order_value": round(avg_order_value, 2),
            "order_types": order_types,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        }

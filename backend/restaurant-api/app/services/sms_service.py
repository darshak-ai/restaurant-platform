from typing import Optional
import random
import string
from datetime import datetime, timedelta
from twilio.rest import Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.client = None
        if settings.twilio_account_sid and settings.twilio_auth_token:
            self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)

    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP code"""
        return ''.join(random.choices(string.digits, k=length))

    def send_otp(self, phone_number: str, otp_code: str) -> bool:
        """Send OTP via SMS using Twilio"""
        if not self.client or not settings.twilio_phone_number:
            logger.warning("Twilio not configured, OTP would be sent to: %s with code: %s", phone_number, otp_code)
            return True  # Return True for development/testing

        try:
            message = self.client.messages.create(
                body=f"Your restaurant order verification code is: {otp_code}. This code expires in 10 minutes.",
                from_=settings.twilio_phone_number,
                to=phone_number
            )
            logger.info("OTP sent successfully to %s, message SID: %s", phone_number, message.sid)
            return True
        except Exception as e:
            logger.error("Failed to send OTP to %s: %s", phone_number, str(e))
            return False

    def send_order_confirmation(self, phone_number: str, order_number: str, restaurant_name: str) -> bool:
        """Send order confirmation SMS"""
        if not self.client or not settings.twilio_phone_number:
            logger.warning("Order confirmation would be sent to: %s for order: %s", phone_number, order_number)
            return True

        try:
            message = self.client.messages.create(
                body=f"Order confirmed! Your order #{order_number} at {restaurant_name} has been received. You'll receive updates on your order status.",
                from_=settings.twilio_phone_number,
                to=phone_number
            )
            logger.info("Order confirmation sent to %s, message SID: %s", phone_number, message.sid)
            return True
        except Exception as e:
            logger.error("Failed to send order confirmation to %s: %s", phone_number, str(e))
            return False

    def send_order_ready_notification(self, phone_number: str, order_number: str) -> bool:
        """Send order ready notification SMS"""
        if not self.client or not settings.twilio_phone_number:
            logger.warning("Order ready notification would be sent to: %s for order: %s", phone_number, order_number)
            return True

        try:
            message = self.client.messages.create(
                body=f"Your order #{order_number} is ready for pickup! Please come to the restaurant to collect your order.",
                from_=settings.twilio_phone_number,
                to=phone_number
            )
            logger.info("Order ready notification sent to %s, message SID: %s", phone_number, message.sid)
            return True
        except Exception as e:
            logger.error("Failed to send order ready notification to %s: %s", phone_number, str(e))
            return False

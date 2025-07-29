import requests
import json
from typing import Dict, List, Optional, Any
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class POSService:
    def __init__(self):
        self.toast_base_url = settings.toast_api_base_url
        self.clover_base_url = settings.clover_api_base_url

    def get_toast_access_token(self, client_id: str, client_secret: str) -> Optional[str]:
        """Get OAuth access token for Toast API"""
        try:
            url = f"{self.toast_base_url}/authentication/v1/authentication/login"
            headers = {"Content-Type": "application/json"}
            data = {
                "clientId": client_id,
                "clientSecret": client_secret,
                "userAccessType": "TOAST_MACHINE_CLIENT"
            }
            
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                return response.json().get("token", {}).get("accessToken")
            else:
                logger.error("Failed to get Toast access token: %s", response.text)
                return None
        except Exception as e:
            logger.error("Error getting Toast access token: %s", str(e))
            return None

    def sync_toast_restaurants(self, access_token: str) -> List[Dict[str, Any]]:
        """Sync restaurant locations from Toast"""
        try:
            url = f"{self.toast_base_url}/restaurants/v1/restaurants"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Toast-Restaurant-External-ID": "YOUR_RESTAURANT_ID"
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error("Failed to sync Toast restaurants: %s", response.text)
                return []
        except Exception as e:
            logger.error("Error syncing Toast restaurants: %s", str(e))
            return []

    def sync_toast_menu(self, access_token: str, restaurant_id: str) -> Dict[str, Any]:
        """Sync menu from Toast"""
        try:
            url = f"{self.toast_base_url}/menus/v1/menus"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Toast-Restaurant-External-ID": restaurant_id
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error("Failed to sync Toast menu: %s", response.text)
                return {}
        except Exception as e:
            logger.error("Error syncing Toast menu: %s", str(e))
            return {}

    def submit_toast_order(self, access_token: str, restaurant_id: str, order_data: Dict[str, Any]) -> Optional[str]:
        """Submit order to Toast POS"""
        try:
            url = f"{self.toast_base_url}/orders/v1/orders"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Toast-Restaurant-External-ID": restaurant_id,
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            if response.status_code == 201:
                return response.json().get("guid")
            else:
                logger.error("Failed to submit Toast order: %s", response.text)
                return None
        except Exception as e:
            logger.error("Error submitting Toast order: %s", str(e))
            return None

    def get_clover_access_token(self, client_id: str, client_secret: str, merchant_id: str) -> Optional[str]:
        """Get OAuth access token for Clover API"""
        try:
            url = f"{self.clover_base_url}/oauth/token"
            data = {
                "client_id": client_id,
                "client_secret": client_secret,
                "code": "authorization_code_here"  # This would come from OAuth flow
            }
            
            response = requests.post(url, data=data)
            if response.status_code == 200:
                return response.json().get("access_token")
            else:
                logger.error("Failed to get Clover access token: %s", response.text)
                return None
        except Exception as e:
            logger.error("Error getting Clover access token: %s", str(e))
            return None

    def sync_clover_merchant(self, access_token: str, merchant_id: str) -> Dict[str, Any]:
        """Sync merchant information from Clover"""
        try:
            url = f"{self.clover_base_url}/v3/merchants/{merchant_id}"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error("Failed to sync Clover merchant: %s", response.text)
                return {}
        except Exception as e:
            logger.error("Error syncing Clover merchant: %s", str(e))
            return {}

    def sync_clover_inventory(self, access_token: str, merchant_id: str) -> List[Dict[str, Any]]:
        """Sync inventory/menu items from Clover"""
        try:
            url = f"{self.clover_base_url}/v3/merchants/{merchant_id}/items"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json().get("elements", [])
            else:
                logger.error("Failed to sync Clover inventory: %s", response.text)
                return []
        except Exception as e:
            logger.error("Error syncing Clover inventory: %s", str(e))
            return []

    def submit_clover_order(self, access_token: str, merchant_id: str, order_data: Dict[str, Any]) -> Optional[str]:
        """Submit order to Clover POS"""
        try:
            url = f"{self.clover_base_url}/v3/merchants/{merchant_id}/orders"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, headers=headers, json=order_data)
            if response.status_code == 200:
                return response.json().get("id")
            else:
                logger.error("Failed to submit Clover order: %s", response.text)
                return None
        except Exception as e:
            logger.error("Error submitting Clover order: %s", str(e))
            return None

    def process_payment_toast(self, access_token: str, restaurant_id: str, payment_data: Dict[str, Any]) -> bool:
        """Process payment through Toast"""
        try:
            url = f"{self.toast_base_url}/orders/v1/orderPayments"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Toast-Restaurant-External-ID": restaurant_id,
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, headers=headers, json=payment_data)
            return response.status_code == 201
        except Exception as e:
            logger.error("Error processing Toast payment: %s", str(e))
            return False

    def process_payment_clover(self, access_token: str, merchant_id: str, payment_data: Dict[str, Any]) -> bool:
        """Process payment through Clover"""
        try:
            url = f"{self.clover_base_url}/v3/merchants/{merchant_id}/payments"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, headers=headers, json=payment_data)
            return response.status_code == 200
        except Exception as e:
            logger.error("Error processing Clover payment: %s", str(e))
            return False

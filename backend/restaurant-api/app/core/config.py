from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///./restaurant.db"
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    toast_client_id: Optional[str] = None
    toast_client_secret: Optional[str] = None
    toast_api_base_url: str = "https://ws-api.toasttab.com"
    
    clover_client_id: Optional[str] = None
    clover_client_secret: Optional[str] = None
    clover_api_base_url: str = "https://api.clover.com"
    
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()

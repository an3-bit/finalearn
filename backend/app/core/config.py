# app/core/config.py
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Google Cloud Configuration
    google_cloud_project: Optional[str] = os.getenv("GOOGLE_CLOUD_PROJECT")
    google_cloud_location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    
    # Database Configuration
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_name: str = os.getenv("DB_NAME", "finalearn")
    db_user: str = os.getenv("DB_USER", "root")
    db_password: str = os.getenv("DB_PASSWORD", "")
    db_port: int = int(os.getenv("DB_PORT", 3306))
    
    # Server Configuration
    port: int = int(os.getenv("PORT", 8000))
    
    # CORS Configuration
    cors_origins: list = [
        "http://localhost:3000", 
        "http://localhost:3001"
    ]
    
    # API Configuration
    api_title: str = "FinaLearn AI Backend"
    api_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"


settings = Settings()

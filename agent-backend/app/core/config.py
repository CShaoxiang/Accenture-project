"""
Configuration Management
Centralized settings management with environment variable support
"""

import os
from typing import Literal
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Service Configuration
    service_name: str = "agent-backend"
    service_version: str = "1.0.0"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./agent.db")
    sql_echo: bool = os.getenv("SQL_ECHO", "false").lower() == "true"

    # JWT Configuration
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expiration_hours: int = 6

    # Server Configuration
    server_host: str = os.getenv("SERVICE_HOST", "0.0.0.0")
    server_port: int = int(os.getenv("SERVICE_PORT", "8000"))

    class Config:
        """Pydantic config"""
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

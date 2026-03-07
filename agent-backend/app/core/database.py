"""
Database Configuration and Session Management
SQLAlchemy ORM setup with connection pooling
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLAlchemy ORM Base
Base = declarative_base()

# Create database engine with connection pooling
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verify connections are alive before using
    echo=settings.sql_echo,  # Log SQL queries if enabled
    connect_args={"timeout": 15} if "sqlite" in settings.database_url else {}
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False, # Disable autocommit to manage transactions manually
    autoflush=False, # Disable sending the SQL UPDATE command to the database 
    bind=engine 
)



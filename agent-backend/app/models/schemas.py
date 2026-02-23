"""
Data Models and Pydantic Schemas
SQLAlchemy ORM models for database layer
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Note: Base is imported from database.py to ensure single declarative_base
from app.core.database import Base


# ==================== SQLAlchemy ORM Models ====================

class Tenant(Base):
    """Multi-tenant organization model"""
    __tablename__ = 'tenants'

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, unique=True, index=True)  # External ID from JWT
    name = Column(String, index=True)
    api_key = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class User(Base):
    """User model with tenant isolation"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), index=True)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentTask(Base):
    """Agent task execution log"""
    __tablename__ = 'agent_tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    task_name = Column(String, index=True)
    status = Column(String, default="pending")  # pending, running, completed, failed
    input_data = Column(Text)  # JSON stored as string
    output_data = Column(Text, nullable=True)  # JSON stored as string
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)


# ==================== Pydantic Schemas (for API validation) ====================

from pydantic import BaseModel
from typing import Optional, Dict, Any


class TenantSchema(BaseModel):
    """Tenant response schema"""
    id: int
    tenant_id: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserSchema(BaseModel):
    """User response schema"""
    id: int
    tenant_id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AgentTaskSchema(BaseModel):
    """Agent task response schema"""
    id: int
    tenant_id: int
    task_name: str
    status: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class AgentTaskCreateSchema(BaseModel):
    """Agent task creation schema"""
    task_name: str
    input_data: Dict[str, Any]


class TokenSchema(BaseModel):
    """JWT token response schema"""
    access_token: str
    token_type: str
    expires_in: int

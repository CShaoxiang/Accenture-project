"""
Data Models and Pydantic Schemas
SQLAlchemy ORM models for database layer
"""

from datetime import datetime
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

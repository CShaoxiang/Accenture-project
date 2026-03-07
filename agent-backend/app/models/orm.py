from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text , JSON
from datetime import  datetime ,timezone

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
    created_at = Column(DateTime, lambda: datetime.now(timezone.utc))
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
    created_at = Column(DateTime,lambda: datetime.now(timezone.utc))


class AgentTask(Base):
    """Agent task execution log"""
    __tablename__ = 'agent_tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    task_name = Column(String, index=True)
    status = Column(String, default="pending")  # pending, running, completed, failed
    input_data = Column(JSON)  # JSON stored as string
    output_data = Column(JSON, nullable=True)  # JSON stored as string
    created_at = Column(DateTime, lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)
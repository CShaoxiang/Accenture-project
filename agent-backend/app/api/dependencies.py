"""
FastAPI Dependencies
Reusable dependency functions for route handlers
"""

import contextvars
from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import verify_jwt_token
from app.core.database import SessionLocal
from app.models.orm import Tenant as TenantModel

# Security scheme for FastAPI
security = HTTPBearer()

# Thread-local context storage (safe for async)
tenant_context = contextvars.ContextVar('tenant_context', default=None)
user_context = contextvars.ContextVar('user_context', default=None)


async def get_current_tenant(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to extract and validate tenant from JWT
    
    Usage in FastAPI routes:
        async def my_route(tenant_data = Depends(get_current_tenant)):
            tenant_db_id = tenant_data['tenant_id']
            ...
    
    Returns:
        Dictionary with tenant info and user_id
    """
    payload = verify_jwt_token(credentials.credentials)
    
    # Validate tenant exists in database
    db = SessionLocal()
    try:
        tenant = db.query(TenantModel).filter(
            TenantModel.tenant_id == payload['tenant_id'],
            TenantModel.is_active == True
        ).first()
        
        if not tenant:
            raise HTTPException(status_code=403, detail="Tenant not found or inactive")
        
        # Store in context for use in route handlers
        tenant_context.set(tenant)
        user_context.set(payload.get('user_id'))
        
        return {
            'tenant': tenant,
            'tenant_id': tenant.id,  # Database ID
            'external_tenant_id': payload['tenant_id'],  # JWT ID
            'user_id': payload.get('user_id')
        }
    finally:
        db.close()


def get_tenant_context() -> Optional[object]:
    """Get current tenant from context"""
    return tenant_context.get()


def get_user_context() -> Optional[int]:
    """Get current user ID from context"""
    return user_context.get()


def get_db():
    """
    Dependency for getting database session
    
    Usage in FastAPI routes:
        async def my_route(db = Depends(get_db_session)):
            ...
    """
    # Create a new database session for the request
    db = SessionLocal()
    try:
        # pauses the function , hands this session to API route
        yield db
        db.commit()     
    except Exception as e:
        db.rollback()  
        raise e

    finally:
        # After the request is done, close the session to free resources
        db.close()


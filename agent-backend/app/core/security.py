"""
JWT Security and Token Management
Handles JWT token verification and tenant context
"""

from fastapi import HTTPException
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict
from app.core.config import settings


def verify_jwt_token(token: str) -> Dict:
    """
    Verify JWT token signature and extract payload
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload with tenant_id and user_id
        
    Raises:
        HTTPException: If token is invalid or signature verification fails
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        tenant_id = payload.get('tenant_id')
        user_id = payload.get('user_id')
        
        if not tenant_id:
            raise HTTPException(status_code=400, detail="tenant_id not found in token")
        
        return {
            'tenant_id': tenant_id,
            'user_id': user_id,
            'sub': payload.get('sub')  # Subject (username typically)
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidSignatureError:
        raise HTTPException(status_code=401, detail="Invalid token signature")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid JWT token")


def create_jwt_token(tenant_id: str, user_id: int, username: str, hours: Optional[int] = None) -> str:
    """
    Create a new JWT token
    
    Args:
        tenant_id: External tenant identifier
        user_id: Internal user ID
        username: Username/subject
        hours: Token expiration hours (default from settings)
        
    Returns:
        JWT token string
    """
    if hours is None:
        hours = settings.jwt_expiration_hours
    
    now = datetime.utcnow()
    expiry = now + timedelta(hours=hours)
    
    payload = {
        'tenant_id': tenant_id,
        'user_id': user_id,
        'sub': username,
        'iat': int(now.timestamp()),
        'exp': int(expiry.timestamp())
    }
    
    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    
    return token

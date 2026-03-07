"""
JWT Security and Token Management
Handles JWT token verification and tenant context
"""
import jwt
from datetime import datetime, timedelta , timezone
from app.core.config import settings
from app.models.tokens import TokenPayload 
from app.exceptions.collectionExceptions import InvalidTokenException, ExpiredTokenException



def verify_jwt_token(token: str) -> TokenPayload:
    """
    Verify JWT token signature and extract payload
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload with tenant_id and user_id
        
    Raises:
        InvalidTokenException: If token is invalid or signature fails
        ExpiredTokenException: If token has expired
    """
    if not token or not isinstance(token, str) or len(token.strip()) == 0:
        raise InvalidTokenException()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        tenant_id = payload.get('tenant_id')
        user_id = payload.get('user_id')
        
        if not tenant_id:
            raise InvalidTokenException()
        
        return TokenPayload(
            tenant_id = tenant_id,
            user_id = user_id,
            sub  = payload.get('sub')
        )
        
    except jwt.ExpiredSignatureError:
        raise ExpiredTokenException()
    except (jwt.InvalidSignatureError, jwt.DecodeError):
        raise InvalidTokenException()


def create_jwt_token(token : TokenPayload) -> str:
    """
    Create a new JWT token from TokenPayload DTO
    """
    hours = settings.jwt_expiration_hours
    
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(hours=hours)
    
    payload = {
        'tenant_id': token.tenant_id,
        'user_id': token.user_id,
        'sub': token.sub,
        'iat': int(now.timestamp()),
        'exp': int(expiry.timestamp())
    }
    
    encode_token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    
    return encode_token

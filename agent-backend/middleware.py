from fastapi import Request,HttpException
import jwt

def get_tenant_from_jwt(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise HttpException(status_code=401, detail="Authorization header missing")
    
    token = auth_header.split(" ")[1]  # Assuming "Bearer <token>"
    
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        tenant_id = payload.get('tenant_id')
        if not tenant_id:
            raise HttpException(status_code=400, detail="Tenant ID not found in token")
        return tenant_id
    except jwt.DecodeError:
        raise HttpException(status_code=400, detail="Invalid JWT token")
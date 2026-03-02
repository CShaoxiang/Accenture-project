from pydantic import BaseModel

class TokenPayload(BaseModel):
    tenant_id : str
    user_id : int
    sub : str
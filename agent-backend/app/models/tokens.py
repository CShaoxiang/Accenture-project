from pydantic import base_model

class TokenPayload(BaseModel):
    tenant_id : str
    user_id : int
    sub : str
from pydantic import BaseModel

class TokenPayload(BaseModel):
    tenant_id : str
    user_id : int
    sub : str

class TenantContext(BaseModel):
    tenant_id: int
    external_tenant_id: str
    user_id: int | None
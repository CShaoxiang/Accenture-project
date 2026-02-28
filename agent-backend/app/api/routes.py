"""
FastAPI Routes
Organized endpoints for health, authentication, and agent operations
"""

import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import SessionLocal
from app.core.security import create_jwt_token
from app.models.schemas import (
    Tenant, User, AgentTask,
    TenantSchema, TokenSchema, AgentTaskSchema,
    AgentTaskCreateSchema
)
from app.api.dependencies import get_current_tenant, get_db
from app.exceptions.collextionExceptions import DatabaseConnectionException

# ==================== HEALTH ROUTER ====================
router_health = APIRouter(tags=["Health"])


@router_health.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "agent-backend",
        "timestamp": datetime.utcnow().isoformat()
    }


@router_health.get("/")
def read_root():
    """Welcome endpoint"""
    return {
        "service": "Agent Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# ==================== AUTH ROUTER ====================
router_auth = APIRouter(prefix="/auth", tags=["Authentication"])


@router_auth.post("/register-tenant")
def register_tenant(
    tenant_name: str, 
    api_key: str,
    db :  Session = Depends(get_db)
    ):
    """
    Register a new tenant (typically called by admin/setup service)
    
    Args:
        tenant_name: Name of the organization/tenant
        api_key: API key for the tenant
    """
    
    # Generate a unique tenant_id
    tenant_id = str(uuid.uuid4())
        
    new_tenant = Tenant(
            tenant_id=tenant_id,
            name=tenant_name,
            api_key=api_key,
            is_active=True
    )
    db.add(new_tenant)
    db.refresh(new_tenant)
        
    return {
            "status": "success",
            "tenant_id": tenant_id,
            "message": f"Tenant '{tenant_name}' registered successfully"
        }



@router_auth.post("/token", response_model=TokenSchema)
def create_token(
    tenant_id: str, user_id: int, username: str):
    """
    Create JWT token for authenticated tenant/user
    
    In production, this would verify credentials first
    """
    try:
        token = create_jwt_token(tenant_id, user_id, username)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 86400  # 24 hours
        }
    except Exception as e:
        raise InvalidTokenException()


# ==================== AGENT ROUTER ====================
router_agent = APIRouter(prefix="/agent", tags=["Agent"])


@router_agent.post("/task", response_model=AgentTaskSchema)
async def create_agent_task(
    task_data: AgentTaskCreateSchema,
    tenant_data = Depends(get_current_tenant),
    db = Depends(get_db)
):
    """
    Create a new agent task for execution
    
    Args:
        task_data: Task name and input data
        tenant_data: Injected tenant context from JWT
        db: Database session
    """
   
        task = AgentTask(
            tenant_id=tenant_data['tenant_id'],
            user_id=tenant_data['user_id'],
            task_name=task_data.task_name,
            input_data= task_data.input_data,  # JSON will be stored as string
            status="pending"
        )
        db.add(task)
        db.flush()  # Get ID before commit
        
        return task


@router_agent.get("/task/{task_id}", response_model=AgentTaskSchema)
async def get_agent_task(
    task_id: int,
    tenant_data = Depends(get_current_tenant),
    db = Depends(get_db)
):
    """Retrieve task status (tenant-scoped)"""
   
        task = db.query(AgentTask).filter(
            AgentTask.id == task_id,
            AgentTask.tenant_id == tenant_data['tenant_id']  # Tenant isolation
        ).first()
        
        if not task:
            raise TaskNotFoundException()
        
        return AgentTaskSchema(
            id=task.id,
            tenant_id=task.tenant_id,
            task_name=task.task_name,
            status=task.status,
            input_data= task.input_data,
            output_data=task.output_data,
            created_at=task.created_at,
            completed_at=task.completed_at,
            error_message=task.error_message
        )
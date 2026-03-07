# Guided Refactoring Plan - Professional Structure

## Overview
Converting flat structure → professional modular architecture (7 steps)

---

## 📋 STEP 1: Create Directory Structure

**What will happen:**
```
agent-backend/                    (existing dir, stays same)
└── app/                          (CREATE - new root for application code)
    ├── __init__.py              (CREATE - makes it a package)
    ├── api/                     (CREATE - FastAPI routes)
    │   ├── __init__.py
    │   ├── routes.py            (NEW - from main.py routes)
    │   └── dependencies.py      (NEW - from middleware.py)
    ├── core/                    (CREATE - configuration & infrastructure)
    │   ├── __init__.py
    │   ├── config.py            (NEW - settings from main.py)
    │   ├── security.py          (NEW - from middleware.py)
    │   └── database.py          (MOVE - from current database.py)
    ├── models/                  (CREATE - data layer)
    │   ├── __init__.py
    │   └── schemas.py           (MOVE - from current models.py)
    ├── agents/                  (CREATE - agent execution)
    │   ├── __init__.py
    │   └── executor.py          (NEW - ready for LangGraph)
    ├── tools/                   (CREATE - tool definitions)
    │   ├── __init__.py
    │   └── definitions.py       (NEW - tool catalog)
    └── monitoring/              (CREATE - observability)
        ├── __init__.py
        └── observability.py     (NEW - from main.py logging)
├── main.py                      (KEEP - app factory)
├── pyproject.toml              (CREATE - new deps file)
├── requirements.txt            (KEEP - for pip compatibility)
├── .env.example                (KEEP)
+── tests/                       (CREATE - test directory)
│   ├── __init__.py
│   └── test_api.py             (NEW - test suite)
```

**Files Created:** 14  
**Files Moved:** 3  
**Files Deleted:** 0 (old files archived)  
**Files Kept:** 3

---

## 📋 STEP 2: Move & Refactor Core Modules

### **2a) database.py → app/core/database.py**
**Changes:**
- No code changes to database logic
- Just move to new location
- Update relative imports

**Why:** Database is core infrastructure, belongs in `core/`

### **2b) middleware.py → app/core/security.py + app/api/dependencies.py**
**Changes:**
- `security.py`: JWT verification logic (`verify_jwt_token`)
- `dependencies.py`: FastAPI dependencies (`get_current_tenant`)
- Old `middleware.py` gets archived

**Why:** 
- Security logic = `core/` (infrastructure)
- Route dependencies = `api/` (what routes use)

### **2c) models.py → app/models/schemas.py**
**Changes:**
- Rename `models.py` → `schemas.py` (Pydantic convention)
- Keep SQLAlchemy models in `app/core/database.py` (infrastructure)

**Why:** Clear distinction between ORM (infrastructure) and Pydantic schemas (API contracts)

---

## 📋 STEP 3: Create API Routes Module

### **app/api/routes.py**
**Source:** All routes from `main.py`

**Will contain:**
```python
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_tenant
from app.core.config import settings

# Split into routers
router_health = APIRouter()
router_auth = APIRouter()
router_agent = APIRouter()

@router_health.get("/health")
def health_check():
    ...

@router_auth.post("/auth/register-tenant")
def register_tenant(...):
    ...

@router_agent.post("/agent/task")
async def create_agent_task(...):
    ...
```

**Why:** Routes are now modular, can be extended independently

---

## 📋 STEP 4: Create Config Management

### **app/core/config.py**
**Will contain:**
```python
from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./agent.db"
    sql_echo: bool = False
    
    # JWT
    jwt_secret: str = "your-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Service
    service_name: str = "agent-backend"
    service_version: str = "1.0.0"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

**Why:** 
- Centralized configuration
- Type-safe (Pydantic validation)
- Easy to extend later

---

## 📋 STEP 5: Setup Agents Framework

### **app/agents/executor.py**
**Will contain:**
```python
from app.models.schemas import AgentTask
from app.tools.definitions import TOOL_CATALOG

class AgentExecutor:
    def __init__(self, tools: dict = None):
        self.tools = tools or TOOL_CATALOG
    
    async def execute_task(self, task: AgentTask):
        # Ready for LangGraph integration
        # workflow = create_workflow(task.name)
        # result = workflow.invoke(task.input_data)
        pass

# Later: Add LangGraph workflows
# from langgraph.graph import StateGraph
```

**Why:** 
- Foundation for agent logic
- Ready for LangGraph when needed
- Decoupled from FastAPI routes

### **app/tools/definitions.py**
**Will contain:**
```python
TOOL_CATALOG = {
    # Placeholder tools, extend as needed
    "document_processor": None,
    "data_analyzer": None,
    "webhook_caller": None,
}

def register_tool(name: str, tool_class):
    """Plugin system for tools"""
    TOOL_CATALOG[name] = tool_class
```

---

## 📋 STEP 6: Create pyproject.toml (Modern)

### **pyproject.toml**
**Will contain:**
```toml
[build-system]
requires = ["setuptools>=65.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "agent-backend"
version = "1.0.0"
description = "Multi-tenant agent execution service with FastAPI"
requires-python = ">=3.10"

dependencies = [
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0",
    "sqlalchemy==2.0.23",
    "pydantic-settings==2.1.0",
    "pyjwt==2.8.1",
    # ... rest of deps
]

[project.optional-dependencies]
dev = [
    "pytest==7.4.3",
    "black==23.12.0",
    "flake8==6.1.0",
]
langgraph = [
    "langgraph==0.1.x",
    "langchain==0.1.x",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
```

**Why:**
- Industry standard (PEP 517/518)
- Optional dependencies (lean installs)
- Better IDE support

**Keep requirements.txt:** Yes, for `pip install -r requirements.txt` workflows

---

## 📋 STEP 7: Update Imports & Test

### **main.py (refactored)**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import router_health, router_auth, router_agent
from app.monitoring.observability import setup_logging

# Setup
setup_logging(settings.log_level)
app = FastAPI(
    title=settings.service_name,
    version=settings.service_version
)

# Middleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Routes
app.include_router(router_health)
app.include_router(router_auth)
app.include_router(router_agent)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Testing:**
```powershell
# Install from refactored structure
pip install -e .

# Or traditional
pip install -r requirements.txt

# Run
python main.py

# Test
pytest tests/
```

---

## 🔄 Migration Path

```
Current Directory:           After Refactor:
.                           .
├── main.py                 ├── main.py (simplified)
├── middleware.py           ├── app/
├── models.py               │   ├── api/
├── database.py             │   │   ├── routes.py
├── test_multi_tenant.py    │   │   └── dependencies.py
└── requirements.txt        │   ├── core/
                            │   │   ├── config.py
                            │   │   ├── security.py
                            │   │   └── database.py
                            │   ├── models/
                            │   │   └── schemas.py
                            │   ├── agents/
                            │   │   └── executor.py
                            │   ├── tools/
                            │   │   └── definitions.py
                            │   └── monitoring/
                            │       └── observability.py
                            ├── tests/
                            │   └── test_api.py
                            ├── pyproject.toml
                            └── requirements.txt
```

---

## ✅ Benefits After Refactoring

| Benefit | How You'll Notice |
|---------|-------------------|
| **Scalability** | Easy to add new agents, tools, endpoints |
| **Maintainability** | Clear where to find/modify code |
| **Testing** | Run `pytest` to test modules independently |
| **Onboarding** | New developer understands structure immediately |
| **LangGraph Ready** | `app/agents/` is purpose-built for LangGraph |
| **IDE Support** | Better autocomplete, type hints |
| **CI/CD** | Cleaner artifact structure for deployment |
| **Extensibility** | Tool plugin system, agent workflows |

---

## ⚠️ What Stays the Same

- ✅ All SQLAlchemy models (just moved location)
- ✅ All FastAPI routes (just reorganized)
- ✅ All JWT logic (just split into security + dependencies)
- ✅ All logging (just encapsulated)
- ✅ Database schema
- ✅ API behavior (URLs stay same)
- ✅ External contracts (JWT tokens, API responses)

**Zero breaking changes to external consumers!**

---

## 🚀 Next: Ready to Begin?

Changes will be:

1. ✨ **Directory structure created**
2. 🔄 **Imports updated** (all files will work)
3. 📝 **New config system** (centralized settings)
4. 🏗️ **Agent foundation** (ready for LangGraph)
5. 🧪 **Tests updated** (run pytest)

**Should I proceed with the full refactoring?** (Yes/No)

---

**Status:** Ready to execute guided refactoring  
**Time estimate:** ~10-15 minutes (automated)  
**Risk level:** LOW (no logic changes, just organization)

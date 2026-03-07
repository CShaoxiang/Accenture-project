"""
Agent Backend Application Factory
Main entry point for the FastAPI service
"""

import logging
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import refactored modules
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import router_health, router_auth, router_agent
from app.monitoring.observability import setup_logging, get_logger, log_request, log_response

# ==================== SETUP ====================

# Configure logging
setup_logging(settings.log_level)
logger = get_logger(__name__)

# ==================== CREATE FASTAPI APP ====================

app = FastAPI(
    title=settings.service_name,
    description="Multi-tenant agent execution service with FastAPI and LangGraph support",
    version=settings.service_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ==================== MIDDLEWARE ====================

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Logging Middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Log all incoming requests and responses"""
    start_time = datetime.utcnow()
    
    log_request(
        logger,
        request.method,
        request.url.path,
        request.client.host if request.client else "unknown"
    )
    
    response = await call_next(request)
    
    process_time = (datetime.utcnow() - start_time).total_seconds()
    log_response(logger, request.method, request.url.path, response.status_code, process_time)
    
    return response


# ==================== DATABASE INITIALIZATION ====================

@app.on_event("startup")
def on_startup():
    """Initialize database and startup tasks"""
    logger.info("Starting Agent Backend Service...")
    logger.info(f"Database: {settings.database_url}")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")


@app.on_event("shutdown")
def on_shutdown():
    """Cleanup on shutdown"""
    logger.info("Shutting down Agent Backend Service...")


# ==================== INCLUDE ROUTERS ====================

app.include_router(router_health)
app.include_router(router_auth)
app.include_router(router_agent)


# ==================== ERROR HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# ==================== ENTRY POINT ====================

if __name__ == "__main__":
    logger.info(f"Starting service on {settings.server_host}:{settings.server_port}")
    uvicorn.run(
        app,
        host=settings.server_host,
        port=settings.server_port,
        log_level=settings.log_level.lower()
    )
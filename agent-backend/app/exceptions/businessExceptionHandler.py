from fastapi import Request, FastAPI   
from fastapi.responses import JSONResponse
from app.exceptions.baseException import BusinessException
import logging

logger = logging.getLogger(__name__)

# Handle business exceptions
@app.exception_handler(BusinessException)
async def business_exception_handler(request: Request, exc: BusinessException):

    logger.warning(f"Bussiness error at : {request.url} : {exc.message}")

    return JSONResponse(
        status_code = 400,
        content = {
            "code": exc.code,
            "message": exc.message,
            "status": "ERROR"
        }
    )

# Handle uncaught system exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request : Request , exc : BusinessException):
    
    logger.error(f"System Error at : {request.url} : {exc.message} " , exc_info = True)

    return JSONResponse(
        status_code = 500,
        content = {
            "code": 500,
            "message" : "Internal Server Error , Please contact support",
            "status": "ERROR"
        }
)
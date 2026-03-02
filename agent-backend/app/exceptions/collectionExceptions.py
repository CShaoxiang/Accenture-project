from app.exceptions.baseException import BusinessException
from app.enums import ResponseCodeEnum
class InvalidTokenException(BusinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.INVALID_TOKEN)
    
class ExpiredTokenException(BusinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.TOKEN_EXPIRED)

class DBConnectionException(BusinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.DB_CONNECTION_FAILED)

class TaskNotFoundException(BusinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.CODE_404)
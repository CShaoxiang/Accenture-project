from api.exceptions.baseException import BusinessException
from api.enums import ResponseCodeEnum
class InvalidTokenException(BussinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.INVALID_TOKEN)
    
class ExpiredTokenException(BussinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.TOKEN_EXPIRED)

class DBConnectionException(BussinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.DB_CONNECTION_FAILED)

class TaskNotFoundException(BussinessException):
    def __init__(self):
        super().__init__(ResponseCodeEnum.CODE_404)
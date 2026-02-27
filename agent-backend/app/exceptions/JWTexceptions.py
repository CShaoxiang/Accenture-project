from api.exceptions.baseException import BusinessException
from api.enums import ResponseCodeEnum
class InvalidTokenException(BussinessException, ResponseCodeEnum):
    def __init__(self):
        super().__init__(ResponseCodeEnum.INVALID_TOKEN)
    
class ExpiredTokenException(BussinessException, ResponseCodeEnum):
    def __init__(self):
        super().__init__(ResponseCodeEnum.TOKEN_EXPIRED)
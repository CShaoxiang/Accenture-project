from core.enums import ResponseCodeEnum

class BusinessException(Exception):
    """Base class for all bussiness-logic domain errors"""

    def __init__(self, error_enum : ResponseCodeEnum):
        self.codeEnum = error_enum
        self.code = error_enum.code
        self.message = error_enum.message
        super().__init__(self.message)
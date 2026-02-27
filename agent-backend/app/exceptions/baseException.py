from core.enums import ResponseCodeEnum

class BusinessException(Exception):
    """Base class for all bussiness-logic domain errors"""

    def init__(self, error_enum : ResponseCodeEnum):
        self.codeEnum = error_enum
        self.code = error_enum.code
        self.message = errpr_enum.message
        super().__init__(self.message)
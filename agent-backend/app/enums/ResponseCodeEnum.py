from enum import Enum


class ResponseCodeEnum(Enum):
    CODE_200 = (200,"Request successful")
    CODE_400 = (400,"Bad request")
    CODE_401 = (401,"Unauthorized")
    CODE_403 = (403,"Forbidden")
    CODE_404 = (404,"Not found")
    CODE_500 = (500,"Internal server error")

    #JWT related
    TOKEN_EXPIRED = (900,"Token has expired")
    INVALID_TOKEN = (901,"Invalid token signature")

    #Database related
    DB_CONNECTION_FAILED = (1000,"Database connection failed")

    # Business logic related


    @property
    def getCode(self) -> int:
        return self.value[0]

    @property
    def getMessage(self) -> str:
        return self.value[1]


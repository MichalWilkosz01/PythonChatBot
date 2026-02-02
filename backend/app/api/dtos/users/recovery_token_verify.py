from pydantic import BaseModel

class RecoveryTokenVerify(BaseModel):
    username: str
    recovery_token: str

from pydantic import BaseModel

class PasswordReset(BaseModel):
    token: str
    new_password: str

from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str          
    username: str       
    password: str
from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    email: str          
    username: str       
    password: str
    gemini_api_key: str
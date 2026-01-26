from typing import Optional

from pydantic import BaseModel


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    new_password: Optional[str] = None
    api_key: Optional[str] = None
from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    username: str
    email: str
    recovery_tokens: List[str]

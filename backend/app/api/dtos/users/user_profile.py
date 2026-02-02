from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    username: str
    email: str
    api_key: Optional[str] = None
    recovery_tokens: List[str]

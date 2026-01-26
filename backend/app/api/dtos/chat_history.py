from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class MessageDTO(BaseModel):
    id: int
    query: str
    response: str
    created_at: datetime
    
    class Config:
        from_attributes = True

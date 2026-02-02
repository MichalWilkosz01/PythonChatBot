from pydantic import BaseModel
from typing import List
from datetime import datetime

class ConversationHistory(BaseModel):
    id: int
    title: str
    created_at: datetime 

    class Config:
        from_attributes = True
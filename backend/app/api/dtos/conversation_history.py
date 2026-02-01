from pydantic import BaseModel
from typing import List
from datetime import datetime

class ConversationHistory(BaseModel):
    id: int
    title: str
    created_at: datetime  # Opcjonalne, jeśli chcesz sortować po dacie na froncie

    class Config:
        # To jest KLUCZOWE - pozwala FastAPI czytać dane z obiektów SQLAlchemy
        from_attributes = True
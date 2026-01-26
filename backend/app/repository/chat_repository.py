from typing import List, Optional
from sqlalchemy.orm import Session
from data.models import Message

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_history(self, user_id: int) -> List[Message]:
        return (
            self.db.query(Message)
            .filter(Message.user_id == user_id)
            .order_by(Message.created_at.asc())
            .all()
        )

    def create_message(self, user_id: int, query: str, response: str, conversation_id: Optional[int] = None) -> Message:
        msg = Message(
            user_id=user_id,
            query=query,
            response=response,
            conversation_id=conversation_id
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

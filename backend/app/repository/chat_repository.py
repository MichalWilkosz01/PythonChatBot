from sqlalchemy import desc
from sqlalchemy.orm import Session
from data.models import Conversation, Message # Upewnij się, że importujesz właściwe modele

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(self, user_id: int, title: str) -> int:
        """Tworzy nową rozmowę i zwraca jej unikalne ID."""
        new_conv = Conversation(
            user_id=user_id,
            title=title
        )
        self.db.add(new_conv)
        self.db.commit()
        self.db.refresh(new_conv)
        return new_conv.id

    def get_user_history(self, user_id: int, conversation_id: int = None):
        """Pobiera wiadomości dla danej rozmowy."""
        query = self.db.query(Message).filter(Message.user_id == user_id)
        if conversation_id:
            query = query.filter(Message.conversation_id == conversation_id)
        return query.order_by(Message.created_at.asc()).all()

    def create_message(self, user_id: int, query: str, response: str, conversation_id: int = None):
        """Zapisuje nową wiadomość w historii."""
        new_msg = Message(
            user_id=user_id,
            query=query,
            response=response,
            conversation_id=conversation_id
        )
        self.db.add(new_msg)
        self.db.commit()
        return new_msg
    
    def get_user_conversations(self, user_id: int):
        """
        Pobiera listę rozmów użytkownika (do paska bocznego).
        Sortuje od najnowszych do najstarszych.
        """
        return self.db.query(Conversation)\
            .filter(Conversation.user_id == user_id)\
            .order_by(desc(Conversation.created_at))\
            .all()
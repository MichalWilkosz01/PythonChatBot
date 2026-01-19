from sqlalchemy.orm import Session
from typing import Optional, List

from data.models import User, UserHistory


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    # ===== USERS =====
    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return (
            self.db.query(User)
            .filter(User.username == username)
            .first()
        )

    def get_by_email(self, email: str) -> Optional[User]:
        return (
            self.db.query(User)
            .filter(User.email == email)
            .first()
        )

    def create(
        self,
        username: str,
        email: str,
        password_hash: str,
        encrypted_api_key: Optional[str] = None,
    ) -> User:
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            encrypted_api_key=encrypted_api_key,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, new_password_hash: str) -> User:
        user.password_hash = new_password_hash
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_api_key(self, user: User, encrypted_api_key: Optional[str]) -> User:
        user.encrypted_api_key = encrypted_api_key
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

    # ===== USER HISTORY =====
    def add_history(
        self,
        user_id: int,
        query: str,
        response: str,
    ) -> UserHistory:
        history = UserHistory(
            user_id=user_id,
            query=query,
            response=response,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get_history(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> List[UserHistory]:
        return (
            self.db.query(UserHistory)
            .filter(UserHistory.user_id == user_id)
            .order_by(UserHistory.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

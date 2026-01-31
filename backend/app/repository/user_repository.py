from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.security import encrypt_data, hash_password, verify_password, SECRET_KEY
from data.models import User
from app.api.dtos.users.user_update import UserUpdate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

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
        recovery_tokens: Optional[str] = None,
    ) -> User:
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            encrypted_api_key=encrypted_api_key,
            recovery_tokens=recovery_tokens,
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
        
    def update_user(self, user_id: int, updates: UserUpdate) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None

        if updates.username:
            user.username = updates.username

        if updates.email:
            user.email = updates.email
        
        if updates.new_password:
            user.password_hash = hash_password(updates.new_password)

        if updates.api_key:
            user.encrypted_api_key = encrypt_data(updates.api_key, SECRET_KEY)

        self.db.commit()
        self.db.refresh(user)
        return user

    def verify_user_credentials(self, username: str, password: str) -> Optional[User]:
        user = self.get_by_username(username)
        if user and verify_password(password, user.password_hash):
            return user
        return None

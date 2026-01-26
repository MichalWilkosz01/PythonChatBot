from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.security import SECRET_KEY, ALGORITHM, decrypt_data
from app.repository.db import get_db
from app.repository.user_repository import UserRepository
from data.models import User

"""
FastAPI Dependencies for Authentication & Context Injection.

Handles JWT validation and extracts:
1. `get_current_user_api_key`: Decrypts the session-based Gemini Key (No DB access required).
2. `get_current_user`: loads the authenticated User from the Database.
"""

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user_api_key(
    token: str = Depends(oauth2_scheme),
) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        session_key = payload.get("sak")
        if not session_key:
             raise HTTPException(status_code=401, detail="Token missing API Key permissions")

        plain_api_key = decrypt_data(session_key, SECRET_KEY)
        
        if not plain_api_key:
             raise credentials_exception

        return plain_api_key

    except JWTError:
        raise credentials_exception

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    repo = UserRepository(db)
    user = repo.get_by_username(username)
    
    if user is None:
        raise credentials_exception
    return user

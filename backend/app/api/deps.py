from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.security import SECRET_KEY, ALGORITHM, decrypt_data
from app.repository.db import get_db
from app.repository.user_repository import UserRepository
from data.models import User

security_scheme = HTTPBearer()

def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    token = auth.credentials
    
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

def get_current_user_api_key(
    current_user: User = Depends(get_current_user),
) -> str:
    if not current_user.encrypted_api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Gemini API Key not found for this user. Please update your profile."
        )

    plain_api_key = decrypt_data(current_user.encrypted_api_key, SECRET_KEY)
    
    if not plain_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt API Key."
        )

    return plain_api_key
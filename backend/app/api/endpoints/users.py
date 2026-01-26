from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.api.dtos.users.refresh_token import RefreshToken
from app.repository.user_repository import UserRepository
from app.api.dtos.users.user_register import UserRegister
from app.api.dtos.users.user_login import UserLogin
from app.api.dtos.users.token import Token
from app.core.security import (
    decrypt_data,
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    encrypt_data,
    SECRET_KEY,
    ALGORITHM,
)
from app.repository.db import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register")
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)

    if repo.get_by_username(data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    if repo.get_by_email(data.email):
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    encrypted_api_key = encrypt_data(data.gemini_api_key, data.password)

    user = repo.create(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        encrypted_api_key=encrypted_api_key,
    )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

@router.post("/login", response_model=Token)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    user = repo.get_by_username(data.username)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    # 1. Decrypt the API Key using the User's Password (which we only have right now).
    plain_api_key = decrypt_data(user.encrypted_api_key, data.password)

    # 2. Re - encrypt it using the Server's SECRET_KEY.
    # The re - encryption here is needed because we don't store the user's password.
    # This means we can't decrypt later without it.
    session_key = encrypt_data(plain_api_key, SECRET_KEY)

    access_payload = {
        "sub": user.username, 
        "type": "access",
        "sak": session_key # Session API Key
    }
    refresh_payload = {"sub": user.username, "type": "refresh"}

    return Token(
        access_token=create_access_token(access_payload),
        refresh_token=create_refresh_token(refresh_payload),
    )


@router.post("/refresh", response_model=Token)
def refresh(data: RefreshToken):
    try:
        payload = jwt.decode(
            data.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type",
            )

        user_id = payload.get("sub")   
        new_access_payload = {"sub": user_id, "type": "access"}
        
        return Token(
            access_token=create_access_token(new_access_payload),
            refresh_token=create_refresh_token({"sub": user_id, "type": "refresh"}),
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

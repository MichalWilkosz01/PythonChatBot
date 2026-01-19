from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import jwt

from app.api.dtos.users.refresh_token import RefreshToken
from app.repository.user_repository import UserRepository          # Line 7
from app.api.dtos.users.user_register import UserRegister          # Line 8
from app.api.dtos.users.user_login import UserLogin                # Line 9 (Predicting this)
from app.api.dtos.users.token import Token
# Zamiast definiować je tutaj, pobierz je z security, żeby były identyczne
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,  # <--- Dodaj to (upewnij się, że jest w security.py)
    ALGORITHM,   # <--- Dodaj to
)
# Usuń: load_dotenv() i os.getenv("SECRET_KEY") z tego pliku
from app.repository.db import get_db


# ================= CONFIG =================

ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = 15
REFRESH_EXPIRE_DAYS = 7

router = APIRouter(prefix="/users", tags=["users"])





# ================= REGISTER =================

@router.post("/register")
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    print("\n" + "="*30)
    print(f"DEBUG REGISTER: Próba rejestracji usera: '{data.username}'")
    print(f"DEBUG REGISTER: Email: '{data.email}'")
    print(f"DEBUG REGISTER: Długość hasła: {len(data.password)}")
    print(f"DEBUG REGISTER: Treść hasła: '{data.password}'") 
    print("="*30 + "\n")
    # --- DEBUG END ---
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

    user = repo.create(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

# ================= LOGIN =================

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

    # POPRAWKA: Tworzymy słowniki z danymi ("sub" to standard dla ID użytkownika)
    access_payload = {"sub": str(user.id), "type": "access"}
    refresh_payload = {"sub": str(user.id), "type": "refresh"}

    return Token(
        access_token=create_access_token(access_payload),
        refresh_token=create_refresh_token(refresh_payload),
    )

# ================= REFRESH TOKEN =================

@router.post("/refresh", response_model=Token)
def refresh(data: RefreshToken):
    try:
        # Używamy zaimportowanego SECRET_KEY i ALGORITHM
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
        
        # Tworzymy nowe tokeny
        new_access_payload = {"sub": user_id, "type": "access"}
        # Opcjonalnie: można też odświeżyć refresh token, ale tu zwracamy ten sam user_id
        
        return Token(
            access_token=create_access_token(new_access_payload),
            refresh_token=create_refresh_token({"sub": user_id, "type": "refresh"}),
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

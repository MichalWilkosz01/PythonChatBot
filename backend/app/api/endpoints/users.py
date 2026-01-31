import json
from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends
from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session

from app.api.dtos.users.refresh_token import RefreshToken
from app.repository.user_repository import UserRepository
from app.api.dtos.users.user_register import UserRegister
from app.api.dtos.users.user_login import UserLogin
from app.api.dtos.users.token import Token
from app.api.dtos.users.user_profile import UserProfile
from app.api.dtos.users.recovery_token_verify import RecoveryTokenVerify
from app.api.dtos.users.password_reset import PasswordReset
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    encrypt_data,
    decrypt_data,
    generate_recovery_tokens,
    SECRET_KEY,
    ALGORITHM,
)
from app.repository.db import get_db
from app.api.deps import get_current_user
from app.api.dtos.users.user_update import UserUpdate
from data.models import User

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

    encrypted_api_key = encrypt_data(data.gemini_api_key, SECRET_KEY)
    
    recovery_tokens = generate_recovery_tokens()
    encrypted_tokens = encrypt_data(json.dumps(recovery_tokens), SECRET_KEY)

    user = repo.create(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        encrypted_api_key=encrypted_api_key,
        recovery_tokens=encrypted_tokens,
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

    access_payload = {
        "sub": user.username, 
        "type": "access"
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

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.patch("/edit", response_model=dict)
def update_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    
    if updates.username and updates.username != current_user.username:
        if repo.get_by_username(updates.username):
            raise HTTPException(status_code=400, detail="Username already taken")

    if updates.email and updates.email != current_user.email:
        if repo.get_by_email(updates.email):
            raise HTTPException(status_code=400, detail="Email already registered")

    updated_user = repo.update_user(current_user.id, updates)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Profile updated successfully"}

@router.get("/account", response_model=UserProfile)
def get_profile(
    current_user: User = Depends(get_current_user),
):
    tokens = []
    if current_user.recovery_tokens:
        try:
            decrypted = decrypt_data(current_user.recovery_tokens, SECRET_KEY)
            if decrypted:
                tokens = json.loads(decrypted)
        except Exception:
            pass 

    return UserProfile(
        username=current_user.username,
        email=current_user.email,
        recovery_tokens=tokens
    )

@router.post("/recover-password")
def verify_recovery_token(
    data: RecoveryTokenVerify,
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    user = repo.get_by_username(data.username) 

    if not user:
         raise HTTPException(status_code=404, detail="User not found")
    
    if not user.recovery_tokens:
         raise HTTPException(status_code=400, detail="No recovery tokens found")

    decrypted = decrypt_data(user.recovery_tokens, SECRET_KEY)
    if not decrypted:
         raise HTTPException(status_code=500, detail="Error decrypting tokens")
    
    tokens = json.loads(decrypted)
    
    if data.recovery_token not in tokens:
        raise HTTPException(status_code=400, detail="Invalid recovery token")
    
    reset_token_expires = timedelta(minutes=15)
    reset_data = {"sub": user.username, "type": "reset"}
    
    reset_token = create_access_token(reset_data, expires_delta=reset_token_expires)

    tokens.remove(data.recovery_token)
    new_encrypted_tokens = encrypt_data(json.dumps(tokens), SECRET_KEY)
    
    user.recovery_tokens = new_encrypted_tokens
    db.commit()

    return {"reset_token": reset_token}

@router.post("/reset-password")
def reset_password(
    data: PasswordReset,
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
             raise HTTPException(status_code=401, detail="Invalid token type")
        
        username = payload.get("sub")
        if not username:
             raise HTTPException(status_code=401, detail="Invalid token subject")
             
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired reset token")

    repo = UserRepository(db)
    user = repo.get_by_username(username)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    repo.update_password(user, hash_password(data.new_password))
    
    return {"message": "Password updated successfully"}

import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

SECRET_KEY = "CHANGE_THIS_TO_A_SUPER_SECRET_KEY"  # You can generate a random string
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _derive_key(password: str, salt: bytes) -> bytes:
    """Derives a base64-encoded URL-safe key from a password and salt using Argon2id."""
    kdf = Argon2id(
        salt=salt,
        length=32,
        iterations=3,
        lanes=4,
        memory_cost=65536,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_data(data: str, password: str) -> str:
    if not data:
        return None

    salt = os.urandom(16)
    
    key = _derive_key(password, salt)
    f = Fernet(key)
    
    token = f.encrypt(data.encode())
    
    salt_b64 = base64.urlsafe_b64encode(salt).decode()
    token_str = token.decode()
    
    return f"{salt_b64}.{token_str}"

def decrypt_data(encrypted_string: str, password: str) -> str:
    if not encrypted_string:
        return None
    
    try:
        salt_b64, token_str = encrypted_string.split(".")
        salt = base64.urlsafe_b64decode(salt_b64)
        
        key = _derive_key(password, salt)
        f = Fernet(key)
        
        return f.decrypt(token_str.encode()).decode()
    except Exception as e:
        print(f"Decryption failed: {e}")
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain password matches the hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """Hashes a password for storage."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a JWT token with an expiration time."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a refresh token with a longer expiration time."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt
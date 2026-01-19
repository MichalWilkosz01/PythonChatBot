import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

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

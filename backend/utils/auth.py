# backend/utils/auth.py - Session-based authentication (no JWT)
from passlib.context import CryptContext
from fastapi import HTTPException, status
import secrets
import os
from datetime import datetime, timedelta
from typing import Optional, Dict

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory session store (in production, use Redis or database)
active_sessions: Dict[str, dict] = {}

# Session configuration
SESSION_EXPIRE_HOURS = int(os.getenv("SESSION_EXPIRE_HOURS", "24"))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_session(user_email: str) -> str:
    """Create a new session and return session ID"""
    session_id = secrets.token_urlsafe(32)
    expire_time = datetime.utcnow() + timedelta(hours=SESSION_EXPIRE_HOURS)
    
    active_sessions[session_id] = {
        "user_email": user_email,
        "created_at": datetime.utcnow(),
        "expires_at": expire_time
    }
    
    return session_id

def verify_session(session_id: str) -> Optional[str]:
    """Verify session and return user email if valid"""
    if session_id not in active_sessions:
        return None
    
    session_data = active_sessions[session_id]
    
    # Check if session has expired
    if datetime.utcnow() > session_data["expires_at"]:
        # Remove expired session
        del active_sessions[session_id]
        return None
    
    return session_data["user_email"]

def invalidate_session(session_id: str) -> bool:
    """Remove session (logout)"""
    if session_id in active_sessions:
        del active_sessions[session_id]
        return True
    return False

def cleanup_expired_sessions():
    """Remove all expired sessions"""
    now = datetime.utcnow()
    expired_sessions = [
        session_id for session_id, data in active_sessions.items()
        if now > data["expires_at"]
    ]
    
    for session_id in expired_sessions:
        del active_sessions[session_id]
    
    return len(expired_sessions)
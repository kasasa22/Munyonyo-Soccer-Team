# backend/dependencies.py - Session-based authentication (no JWT)
from fastapi import Depends, HTTPException, status, Cookie, Request
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from utils.auth import verify_session
from services.user_service import UserService
from models.user import User, UserRole

def get_current_user(
    request: Request,
    session_id: Optional[str] = Cookie(None, alias="session_id"),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from session"""
    
    # Try to get session_id from cookie first, then from Authorization header
    if not session_id:
        # Check if session_id is in Authorization header (for API clients)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Session "):
            session_id = auth_header.replace("Session ", "")
    
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session found. Please login.",
        )
    
    # Verify session
    user_email = verify_session(session_id)
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please login again.",
        )
    
    # Get user from database
    user_service = UserService(db)
    user = user_service.get_user_by_email(user_email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is not active",
        )
    
    return user

def require_role(required_role: UserRole):
    """Dependency to require specific user role"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Optional dependency that doesn't require authentication
def get_current_user_optional(
    request: Request,
    session_id: Optional[str] = Cookie(None, alias="session_id"),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    try:
        return get_current_user(request, session_id, db)
    except HTTPException:
        return None
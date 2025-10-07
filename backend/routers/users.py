# backend/routers/users.py - Session-based authentication (no JWT)
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, Request, Cookie
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas.user import UserCreate, UserUpdate, UserResponse, UserLogin, LoginResponse, LogoutResponse
from services.user_service import UserService
from models.user import User, UserRole
from dependencies import get_current_user, require_admin
from utils.auth import create_session, invalidate_session

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Register a new user (Admin only)"""
    user_service = UserService(db)
    return user_service.create_user(user_data)

@router.post("/login", response_model=LoginResponse)
def login(
    user_credentials: UserLogin, 
    response: Response,
    db: Session = Depends(get_db)
):
    """User login with session creation"""
    user_service = UserService(db)
    user = user_service.authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is not active",
        )
    
    # Create session
    session_id = create_session(user.email)
    
    # Set session cookie (httponly for security)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=24 * 60 * 60  # 24 hours
    )
    
    return LoginResponse(
        message="Login successful",
        user=user,
        session_id=session_id  # Optional: remove if you don't want to expose it
    )

@router.post("/logout", response_model=LogoutResponse)
def logout(
    response: Response,
    request: Request,
    session_id: Optional[str] = Cookie(None, alias="session_id")
):
    """User logout"""
    # Try to get session_id from cookie or header
    if not session_id:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Session "):
            session_id = auth_header.replace("Session ", "")
    
    if session_id:
        invalidate_session(session_id)
    
    # Clear session cookie
    response.delete_cookie(key="session_id")
    
    return LogoutResponse(message="Successfully logged out")

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users"""
    user_service = UserService(db)
    return user_service.get_users(skip=skip, limit=limit, search=search)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user"""
    # Users can only update their own profile unless they're admin
    if str(current_user.id) != user_id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user_service = UserService(db)
    user = user_service.update_user(user_id, user_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete user (Admin only)"""
    user_service = UserService(db)
    success = user_service.delete_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

@router.patch("/{user_id}/status", response_model=UserResponse)
def change_user_status(
    user_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Change user status (Admin only)"""
    user_service = UserService(db)
    user = user_service.change_user_status(user_id, status)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

# Admin endpoint to view active sessions
@router.get("/admin/sessions", tags=["admin"])
def get_active_sessions(current_user: User = Depends(require_admin)):
    """Get active sessions (Admin only)"""
    from utils.auth import active_sessions, cleanup_expired_sessions
    
    # Cleanup expired sessions first
    expired_count = cleanup_expired_sessions()
    
    session_info = []
    for session_id, data in active_sessions.items():
        session_info.append({
            "session_id": session_id[:8] + "...", 
            "user_email": data["user_email"],
            "created_at": data["created_at"],
            "expires_at": data["expires_at"]
        })
    
    return {
        "active_sessions": session_info,
        "total_active": len(active_sessions),
        "expired_cleaned": expired_count
    }
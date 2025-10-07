#backend/services/user_service.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from models.user import User
from schemas.user import UserCreate, UserUpdate
from utils.auth import get_password_hash, verify_password
from fastapi import HTTPException, status

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if email already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            status=user_data.status,
            password_hash=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_users(self, skip: int = 0, limit: int = 100, search: str = None) -> List[User]:
        """Get all users with optional search"""
        query = self.db.query(User)
        
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()
    
    def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user"""
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return None
        
        # Check if email is being changed and already exists
        if user_data.email and user_data.email != db_user.email:
            existing_user = self.get_user_by_email(user_data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Update fields
        for field, value in user_data.dict(exclude_unset=True).items():
            if field == "password" and value:
                setattr(db_user, "password_hash", get_password_hash(value))
            else:
                setattr(db_user, field, value)
        
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return False
        
        self.db.delete(db_user)
        self.db.commit()
        return True
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user login"""
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    def change_user_status(self, user_id: str, status: str) -> Optional[User]:
        """Change user status"""
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return None
        
        db_user.status = status
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
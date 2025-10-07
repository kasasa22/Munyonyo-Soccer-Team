# backend/schemas/user.py - Fixed UUID serialization
from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional
from datetime import datetime
from models.user import UserRole, UserStatus
import uuid

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    status: UserStatus = UserStatus.active

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: uuid.UUID  # Keep as UUID type
    created_at: datetime
    updated_at: datetime
    
    # Add serializer to convert UUID to string
    @field_serializer('id')
    def serialize_id(self, value: uuid.UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Updated response for session-based auth (no JWT)
class LoginResponse(BaseModel):
    message: str
    user: UserResponse
    session_id: Optional[str] = None  # Optional session_id

class LogoutResponse(BaseModel):
    message: str
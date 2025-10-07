# backend/schemas/player.py
from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime
from decimal import Decimal
import uuid

class PlayerBase(BaseModel):
    name: str
    phone: str
    annual: Optional[Decimal] = Decimal("150000.00")
    monthly: Optional[Decimal] = Decimal("10000.00")
    pitch: Optional[Decimal] = Decimal("5000.00")
    match_day: Optional[Decimal] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    annual: Optional[Decimal] = None
    monthly: Optional[Decimal] = None
    pitch: Optional[Decimal] = None
    match_day: Optional[Decimal] = None

class PlayerResponse(PlayerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    # Serialize UUID to string
    @field_serializer('id')
    def serialize_id(self, value: uuid.UUID) -> str:
        return str(value)
    
    # Serialize Decimal to float for JSON
    @field_serializer('annual', 'monthly', 'pitch', 'match_day')
    def serialize_decimal(self, value: Optional[Decimal]) -> Optional[float]:
        return float(value) if value is not None else None
    
    class Config:
        from_attributes = True
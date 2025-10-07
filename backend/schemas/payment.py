# backend/schemas/payment.py
from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
import uuid

class PaymentType(str, Enum):
    annual = "annual"
    monthly = "monthly"
    pitch = "pitch"
    matchday = "matchday"

class PaymentBase(BaseModel):
    player_id: uuid.UUID
    player_name: str
    payment_type: PaymentType
    amount: Decimal
    date: date

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    player_id: Optional[uuid.UUID] = None
    player_name: Optional[str] = None
    payment_type: Optional[PaymentType] = None
    amount: Optional[Decimal] = None
    date: Optional[date] = None

class PaymentResponse(BaseModel):
    id: uuid.UUID
    player_id: uuid.UUID
    player_name: str
    payment_type: str
    amount: Decimal
    date: date
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    
    # Serialize UUID to string
    @field_serializer('id', 'player_id', 'created_by')
    def serialize_uuid(self, value: Optional[uuid.UUID]) -> Optional[str]:
        return str(value) if value is not None else None
    
    # Serialize Decimal to float for JSON
    @field_serializer('amount')
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)
    
    class Config:
        from_attributes = True
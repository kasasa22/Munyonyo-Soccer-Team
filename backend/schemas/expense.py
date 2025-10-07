# backend/schemas/expense.py
from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
import uuid

class ExpenseBase(BaseModel):
    description: str
    amount: Decimal
    category: str
    expense_date: date  # New required field
    match_day_id: Optional[uuid.UUID] = None  # Now optional

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    expense_date: Optional[date] = None
    match_day_id: Optional[uuid.UUID] = None

class ExpenseResponse(BaseModel):
    id: uuid.UUID
    description: str
    amount: Decimal
    category: str
    expense_date: date  # Direct date field
    match_day_id: Optional[uuid.UUID] = None  # Optional match day reference
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    
    # Include match day information if linked
    match_day_date: Optional[date] = None
    match_day_opponent: Optional[str] = None
    match_day_venue: Optional[str] = None
    
    # Serialize UUID to string
    @field_serializer('id', 'match_day_id', 'created_by')
    def serialize_uuid(self, value: Optional[uuid.UUID]) -> Optional[str]:
        return str(value) if value is not None else None
    
    # Serialize Decimal to float for JSON
    @field_serializer('amount')
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)
    
    class Config:
        from_attributes = True
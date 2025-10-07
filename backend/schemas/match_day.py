# backend/schemas/match_day.py
from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, date
import uuid

class MatchDayBase(BaseModel):
    match_date: date
    opponent: Optional[str] = None
    venue: Optional[str] = None
    match_type: str = "friendly"

class MatchDayCreate(MatchDayBase):
    pass

class MatchDayUpdate(BaseModel):
    match_date: Optional[date] = None
    opponent: Optional[str] = None
    venue: Optional[str] = None
    match_type: Optional[str] = None

class MatchDayResponse(BaseModel):
    id: uuid.UUID
    match_date: date
    opponent: Optional[str] = None
    venue: Optional[str] = None
    match_type: str
    created_at: datetime
    
    # Serialize UUID to string
    @field_serializer('id')
    def serialize_id(self, value: uuid.UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True
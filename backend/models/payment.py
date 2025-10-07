# backend/models/payment.py
from sqlalchemy import Column, String, DateTime, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), nullable=False)
    player_name = Column(String(255), nullable=False)
    payment_type = Column(String(50), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    date = Column(Date, nullable=False, server_default=func.current_date())
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
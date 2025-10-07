# backend/models/match_day.py
from sqlalchemy import Column, String, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base

class MatchDay(Base):
    __tablename__ = "match_days"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_date = Column(Date, nullable=False, unique=True)
    opponent = Column(String(255), nullable=True)
    venue = Column(String(255), nullable=True)
    match_type = Column(String(50), nullable=False, default='friendly')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships - using back_populates for proper bidirectional relationship
    expenses = relationship("Expense", back_populates="match_day", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MatchDay(id={self.id}, date='{self.match_date}', opponent='{self.opponent}')>"
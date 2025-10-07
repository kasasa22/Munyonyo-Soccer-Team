# backend/models/expense.py
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    expense_date = Column(Date, nullable=False)  # Direct date field
    match_day_id = Column(UUID(as_uuid=True), ForeignKey("match_days.id", ondelete="SET NULL"), nullable=True)  # Optional
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships - using back_populates for proper bidirectional relationship
    match_day = relationship("MatchDay", back_populates="expenses")
    created_by_user = relationship("User")

    def __repr__(self):
        return f"<Expense(id={self.id}, description='{self.description}', amount={self.amount}, date='{self.expense_date}')>"
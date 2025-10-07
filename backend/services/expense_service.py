# backend/services/expense_service.py
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import HTTPException, status

from models.expense import Expense
from models.match_day import MatchDay
from schemas.expense import ExpenseCreate, ExpenseUpdate

class ExpenseService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_expense(self, expense_data: ExpenseCreate, created_by: UUID) -> Expense:
        """Create a new expense"""
        # Validate match_day_id exists if provided
        if expense_data.match_day_id:
            match_day = self.db.query(MatchDay).filter(MatchDay.id == expense_data.match_day_id).first()
            if not match_day:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Match day not found"
                )
        
        db_expense = Expense(
            description=expense_data.description,
            category=expense_data.category,
            amount=expense_data.amount,
            expense_date=expense_data.expense_date,  # Use direct date
            match_day_id=expense_data.match_day_id,  # Optional match day link
            created_by=created_by
        )
        
        self.db.add(db_expense)
        self.db.commit()
        self.db.refresh(db_expense)
        return db_expense
    
    def get_expense_by_id(self, expense_id: UUID) -> Optional[Expense]:
        """Get expense by ID with match day information"""
        return self.db.query(Expense).options(joinedload(Expense.match_day)).filter(Expense.id == expense_id).first()
    
    def get_expenses(
        self,
        skip: int = 0,
        limit: int = 100,
        match_day_id: Optional[UUID] = None,
        category: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        expense_date: Optional[date] = None  # New filter for specific date
    ) -> List[Expense]:
        """Get all expenses with optional filters"""
        query = self.db.query(Expense).options(joinedload(Expense.match_day))
        
        # Apply filters
        if match_day_id:
            query = query.filter(Expense.match_day_id == match_day_id)
        
        if category:
            query = query.filter(Expense.category == category)
        
        if expense_date:
            query = query.filter(Expense.expense_date == expense_date)
        
        # Filter by date range using expense_date
        if start_date:
            query = query.filter(Expense.expense_date >= start_date)
        if end_date:
            query = query.filter(Expense.expense_date <= end_date)
        
        # Order by expense date descending (newest first)
        return query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()
    
    def update_expense(self, expense_id: UUID, expense_data: ExpenseUpdate) -> Optional[Expense]:
        """Update expense"""
        db_expense = self.get_expense_by_id(expense_id)
        if not db_expense:
            return None
        
        # If match_day_id is being updated, verify the new match day exists
        if expense_data.match_day_id and expense_data.match_day_id != db_expense.match_day_id:
            match_day = self.db.query(MatchDay).filter(MatchDay.id == expense_data.match_day_id).first()
            if not match_day:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Match day not found"
                )
        
        # Update fields - handle both dict and object types
        if hasattr(expense_data, 'dict'):
            update_data = expense_data.dict(exclude_unset=True)
        else:
            update_data = expense_data
            
        for field, value in update_data.items():
            if hasattr(db_expense, field):
                setattr(db_expense, field, value)
        
        self.db.commit()
        self.db.refresh(db_expense)
        return db_expense
    
    def delete_expense(self, expense_id: UUID) -> bool:
        """Delete expense"""
        db_expense = self.get_expense_by_id(expense_id)
        if not db_expense:
            return False
        
        self.db.delete(db_expense)
        self.db.commit()
        return True
    
    def get_expenses_by_match_day(self, match_day_id: UUID) -> List[Expense]:
        """Get all expenses for a specific match day"""
        return self.db.query(Expense).filter(Expense.match_day_id == match_day_id).all()
    
    def get_expenses_by_date(self, expense_date: date) -> List[Expense]:
        """Get all expenses for a specific date"""
        return self.db.query(Expense).filter(Expense.expense_date == expense_date).all()
    
    def get_total_expenses_by_match_day(self, match_day_id: UUID) -> float:
        """Get total expenses for a specific match day"""
        result = self.db.query(
            self.db.func.coalesce(self.db.func.sum(Expense.amount), 0)
        ).filter(Expense.match_day_id == match_day_id).scalar()
        
        return float(result) if result else 0.0
    
    def get_total_expenses_by_date(self, expense_date: date) -> float:
        """Get total expenses for a specific date"""
        result = self.db.query(
            self.db.func.coalesce(self.db.func.sum(Expense.amount), 0)
        ).filter(Expense.expense_date == expense_date).scalar()
        
        return float(result) if result else 0.0
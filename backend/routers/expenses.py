# backend/routers/expenses.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from database import get_db
from schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from services.expense_service import ExpenseService
from models.user import User
from dependencies import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

def format_expense_response(expense) -> ExpenseResponse:
    """Format expense with match day information"""
    response_data = {
        "id": expense.id,
        "description": expense.description,
        "amount": expense.amount,
        "category": expense.category,
        "expense_date": expense.expense_date,  # Use expense_date instead of match_day_date
        "match_day_id": expense.match_day_id,
        "created_by": expense.created_by,
        "created_at": expense.created_at,
        "updated_at": expense.updated_at,
    }
    
    # Add match day information if available
    if expense.match_day:
        response_data.update({
            "match_day_date": expense.match_day.match_date,
            "match_day_opponent": expense.match_day.opponent,
            "match_day_venue": expense.match_day.venue,
        })
    
    return ExpenseResponse(**response_data)

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new expense"""
    expense_service = ExpenseService(db)
    expense = expense_service.create_expense(expense_data, created_by=current_user.id)
    return format_expense_response(expense)

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    match_day_id: Optional[UUID] = Query(None),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    expense_date: Optional[date] = Query(None),  # New filter for specific date
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all expenses with optional filters"""
    expense_service = ExpenseService(db)
    expenses = expense_service.get_expenses(
        skip=skip, 
        limit=limit,
        match_day_id=match_day_id,
        category=category,
        start_date=start_date,
        end_date=end_date,
        expense_date=expense_date
    )
    return [format_expense_response(expense) for expense in expenses]

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get expense by ID"""
    expense_service = ExpenseService(db)
    expense = expense_service.get_expense_by_id(expense_id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return format_expense_response(expense)

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: UUID,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update expense"""
    expense_service = ExpenseService(db)
    expense = expense_service.update_expense(expense_id, expense_data)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return format_expense_response(expense)

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete expense"""
    expense_service = ExpenseService(db)
    success = expense_service.delete_expense(expense_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
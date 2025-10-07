# backend/routers/payments.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from database import get_db
from schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from services.payment_service import PaymentService
from models.user import User
from dependencies import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new payment"""
    payment_service = PaymentService(db)
    return payment_service.create_payment(payment_data)

@router.get("/", response_model=List[PaymentResponse])
def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    player_id: Optional[UUID] = Query(None),
    payment_type: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payments with optional filters"""
    payment_service = PaymentService(db)
    return payment_service.get_payments(
        skip=skip, 
        limit=limit,
        player_id=player_id,
        payment_type=payment_type,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment by ID"""
    payment_service = PaymentService(db)
    payment = payment_service.get_payment_by_id(payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment

@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: UUID,
    payment_data: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update payment"""
    payment_service = PaymentService(db)
    payment = payment_service.update_payment(payment_id, payment_data)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete payment"""
    payment_service = PaymentService(db)
    success = payment_service.delete_payment(payment_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
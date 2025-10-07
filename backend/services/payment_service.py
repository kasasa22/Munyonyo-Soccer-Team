# backend/services/payment_service.py
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from uuid import UUID
from datetime import date

from models.payment import Payment
from models.player import Player
from schemas.payment import PaymentCreate, PaymentUpdate
from fastapi import HTTPException, status

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_payment(self, payment_data: PaymentCreate) -> Payment:
        """Create a new payment"""
        # Verify player exists
        player = self.db.query(Player).filter(Player.id == payment_data.player_id).first()
        if not player:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Player not found"
            )
        
        # Use actual player name from DB
        actual_player_name = player.name
        
        # Create new payment (matching your exact table schema)
        db_payment = Payment(
            player_id=payment_data.player_id,
            player_name=actual_player_name,
            payment_type=payment_data.payment_type.value,  # Convert enum to string
            amount=payment_data.amount,
            date=payment_data.date
            # Note: created_by is optional, we'll let it be NULL for now
        )
        
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment
    
    def get_payment_by_id(self, payment_id: UUID) -> Optional[Payment]:
        """Get payment by ID"""
        return self.db.query(Payment).filter(Payment.id == payment_id).first()
    
    def get_payments(
        self, 
        skip: int = 0, 
        limit: int = 100,
        player_id: Optional[UUID] = None,
        payment_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Payment]:
        """Get all payments with optional filters"""
        query = self.db.query(Payment)
        
        # Apply filters
        if player_id:
            query = query.filter(Payment.player_id == player_id)
        
        if payment_type:
            query = query.filter(Payment.payment_type == payment_type)
        
        if start_date:
            query = query.filter(Payment.date >= start_date)
        
        if end_date:
            query = query.filter(Payment.date <= end_date)
        
        # Order by date descending (newest first)
        return query.order_by(Payment.date.desc()).offset(skip).limit(limit).all()
    
    def update_payment(self, payment_id: UUID, payment_data: PaymentUpdate) -> Optional[Payment]:
        """Update payment"""
        db_payment = self.get_payment_by_id(payment_id)
        if not db_payment:
            return None
        
        # Store the updated player name if player_id is being changed
        updated_player_name = None
        
        # If player_id is being updated, verify the new player exists
        if payment_data.player_id and payment_data.player_id != db_payment.player_id:
            player = self.db.query(Player).filter(Player.id == payment_data.player_id).first()
            if not player:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Player not found"
                )
            # Store the actual player name
            updated_player_name = player.name
        
        # Update fields
        update_data = payment_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            # Convert enum to string for payment_type
            if field == "payment_type" and value:
                setattr(db_payment, field, value.value)
            else:
                setattr(db_payment, field, value)
        
        # Update player name if player was changed
        if updated_player_name:
            db_payment.player_name = updated_player_name
        
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment
    
    def delete_payment(self, payment_id: UUID) -> bool:
        """Delete payment"""
        db_payment = self.get_payment_by_id(payment_id)
        if not db_payment:
            return False
        
        self.db.delete(db_payment)
        self.db.commit()
        return True
# backend/services/match_day_service.py
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from uuid import UUID
from datetime import date

from models.match_day import MatchDay
from schemas.match_day import MatchDayCreate, MatchDayUpdate
from fastapi import HTTPException, status

class MatchDayService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_match_day(self, match_day_data: MatchDayCreate) -> MatchDay:
        """Create a new match day"""
        # Check if match day with same date already exists
        existing_match_day = self.db.query(MatchDay).filter(
            MatchDay.match_date == match_day_data.match_date
        ).first()
        
        if existing_match_day:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Match day with this date already exists"
            )
        
        # Create new match day
        db_match_day = MatchDay(
            match_date=match_day_data.match_date,
            opponent=match_day_data.opponent,
            venue=match_day_data.venue,
            match_type=match_day_data.match_type
        )
        
        self.db.add(db_match_day)
        self.db.commit()
        self.db.refresh(db_match_day)
        return db_match_day
    
    def get_match_day_by_id(self, match_day_id: UUID) -> Optional[MatchDay]:
        """Get match day by ID"""
        return self.db.query(MatchDay).filter(MatchDay.id == match_day_id).first()
    
    def get_match_day_by_date(self, match_date: date) -> Optional[MatchDay]:
        """Get match day by date"""
        return self.db.query(MatchDay).filter(MatchDay.match_date == match_date).first()
    
    def get_match_days(
        self, 
        skip: int = 0, 
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[MatchDay]:
        """Get all match days with optional date range filter"""
        query = self.db.query(MatchDay)
        
        # Apply date range filters
        if start_date:
            query = query.filter(MatchDay.match_date >= start_date)
        
        if end_date:
            query = query.filter(MatchDay.match_date <= end_date)
        
        # Order by match date descending (newest first)
        return query.order_by(MatchDay.match_date.desc()).offset(skip).limit(limit).all()
    
    def update_match_day(self, match_day_id: UUID, match_day_data: MatchDayUpdate) -> Optional[MatchDay]:
        """Update match day"""
        db_match_day = self.get_match_day_by_id(match_day_id)
        if not db_match_day:
            return None
        
        # Check if date is being changed and new date already exists
        if match_day_data.match_date and match_day_data.match_date != db_match_day.match_date:
            existing_match_day = self.db.query(MatchDay).filter(
                MatchDay.match_date == match_day_data.match_date,
                MatchDay.id != match_day_id
            ).first()
            
            if existing_match_day:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Match day with this date already exists"
                )
        
        # Update fields
        for field, value in match_day_data.dict(exclude_unset=True).items():
            setattr(db_match_day, field, value)
        
        self.db.commit()
        self.db.refresh(db_match_day)
        return db_match_day
    
    def delete_match_day(self, match_day_id: UUID) -> bool:
        """Delete match day"""
        db_match_day = self.get_match_day_by_id(match_day_id)
        if not db_match_day:
            return False
        
        self.db.delete(db_match_day)
        self.db.commit()
        return True
# backend/routers/match_days.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from database import get_db
from schemas.match_day import MatchDayCreate, MatchDayUpdate, MatchDayResponse
from services.match_day_service import MatchDayService
from models.user import User
from dependencies import get_current_user

router = APIRouter(prefix="/api/match-days", tags=["match-days"])

@router.post("/", response_model=MatchDayResponse, status_code=status.HTTP_201_CREATED)
def create_match_day(
    match_day_data: MatchDayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new match day"""
    match_day_service = MatchDayService(db)
    return match_day_service.create_match_day(match_day_data)

@router.get("/", response_model=List[MatchDayResponse])
def get_match_days(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all match days with optional date range filter"""
    match_day_service = MatchDayService(db)
    return match_day_service.get_match_days(
        skip=skip, 
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/{match_day_id}", response_model=MatchDayResponse)
def get_match_day(
    match_day_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get match day by ID"""
    match_day_service = MatchDayService(db)
    match_day = match_day_service.get_match_day_by_id(match_day_id)
    
    if not match_day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match day not found"
        )
    
    return match_day

@router.put("/{match_day_id}", response_model=MatchDayResponse)
def update_match_day(
    match_day_id: UUID,
    match_day_data: MatchDayUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update match day"""
    match_day_service = MatchDayService(db)
    match_day = match_day_service.update_match_day(match_day_id, match_day_data)
    
    if not match_day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match day not found"
        )
    
    return match_day

@router.delete("/{match_day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match_day(
    match_day_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete match day"""
    match_day_service = MatchDayService(db)
    success = match_day_service.delete_match_day(match_day_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match day not found"
        )
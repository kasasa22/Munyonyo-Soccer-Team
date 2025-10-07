# backend/routers/players.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from database import get_db
from schemas.player import PlayerCreate, PlayerUpdate, PlayerResponse
from services.player_service import PlayerService
from models.user import User
from dependencies import get_current_user

router = APIRouter(prefix="/api/players", tags=["players"])

@router.post("/", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
def create_player(
    player_data: PlayerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new player"""
    player_service = PlayerService(db)
    return player_service.create_player(player_data)

@router.get("/", response_model=List[PlayerResponse])
def get_players(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all players with optional search"""
    player_service = PlayerService(db)
    return player_service.get_players(skip=skip, limit=limit, search=search)

@router.get("/{player_id}", response_model=PlayerResponse)
def get_player(
    player_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get player by ID"""
    player_service = PlayerService(db)
    player = player_service.get_player_by_id(player_id)
    
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    return player

@router.put("/{player_id}", response_model=PlayerResponse)
def update_player(
    player_id: UUID,
    player_data: PlayerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update player"""
    player_service = PlayerService(db)
    player = player_service.update_player(player_id, player_data)
    
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    return player

@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(
    player_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete player"""
    player_service = PlayerService(db)
    success = player_service.delete_player(player_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
# backend/services/player_service.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from uuid import UUID

from models.player import Player
from schemas.player import PlayerCreate, PlayerUpdate
from fastapi import HTTPException, status

class PlayerService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_player(self, player_data: PlayerCreate) -> Player:
        """Create a new player"""
        # Check if player with same name and phone already exists
        existing_player = self.db.query(Player).filter(
            Player.name == player_data.name,
            Player.phone == player_data.phone
        ).first()
        
        if existing_player:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Player with this name and phone number already exists"
            )
        
        # Create new player
        db_player = Player(
            name=player_data.name,
            phone=player_data.phone,
            annual=player_data.annual,
            monthly=player_data.monthly,
            pitch=player_data.pitch,
            match_day=player_data.match_day
        )
        
        self.db.add(db_player)
        self.db.commit()
        self.db.refresh(db_player)
        return db_player
    
    def get_player_by_id(self, player_id: UUID) -> Optional[Player]:
        """Get player by ID"""
        return self.db.query(Player).filter(Player.id == player_id).first()
    
    def get_players(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Player]:
        """Get all players with optional search"""
        query = self.db.query(Player)
        
        if search:
            query = query.filter(
                or_(
                    Player.name.ilike(f"%{search}%"),
                    Player.phone.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()
    
    def update_player(self, player_id: UUID, player_data: PlayerUpdate) -> Optional[Player]:
        """Update player"""
        db_player = self.get_player_by_id(player_id)
        if not db_player:
            return None
        
        # Check if name/phone combination already exists for another player
        if player_data.name or player_data.phone:
            name = player_data.name or db_player.name
            phone = player_data.phone or db_player.phone
            
            existing_player = self.db.query(Player).filter(
                Player.name == name,
                Player.phone == phone,
                Player.id != player_id
            ).first()
            
            if existing_player:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Player with this name and phone number already exists"
                )
        
        # Update fields
        for field, value in player_data.dict(exclude_unset=True).items():
            setattr(db_player, field, value)
        
        self.db.commit()
        self.db.refresh(db_player)
        return db_player
    
    def delete_player(self, player_id: UUID) -> bool:
        """Delete player"""
        db_player = self.get_player_by_id(player_id)
        if not db_player:
            return False
        
        self.db.delete(db_player)
        self.db.commit()
        return True
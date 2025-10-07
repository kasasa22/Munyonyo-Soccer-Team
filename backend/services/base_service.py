# backend/services/base_service.py
from typing import Optional, Type, Any
import logging

logger = logging.getLogger(__name__)

class ServiceError(Exception):
    def __init__(self, message: str, error_code: str = None, status_code: int = 400):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)

class BaseService:
    def __init__(self, db: Session):
        self.db = db
    
    def handle_db_error(self, operation: str, error: Exception):
        logger.error(f"Database error in {operation}: {str(error)}")
        self.db.rollback()
        
        if "unique constraint" in str(error).lower():
            raise ServiceError(
                "Resource already exists",
                "DUPLICATE_RESOURCE",
                409
            )
        elif "foreign key" in str(error).lower():
            raise ServiceError(
                "Referenced resource not found",
                "INVALID_REFERENCE", 
                400
            )
        else:
            raise ServiceError(
                f"Database operation failed: {operation}",
                "DATABASE_ERROR",
                500
            )

# Update your existing services
class PlayerService(BaseService):
    def create_player(self, player_data: PlayerCreate) -> Player:
        try:
            # Check if player exists
            existing_player = self.db.query(Player).filter(
                Player.name == player_data.name,
                Player.phone == player_data.phone
            ).first()
            
            if existing_player:
                raise ServiceError(
                    "Player with this name and phone already exists",
                    "PLAYER_EXISTS",
                    409
                )
            
            db_player = Player(**player_data.dict())
            self.db.add(db_player)
            self.db.commit()
            self.db.refresh(db_player)
            return db_player
            
        except ServiceError:
            raise
        except Exception as e:
            self.handle_db_error("create_player", e)
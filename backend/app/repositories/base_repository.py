"""

// backend/app/repositories/base_repository.py
Generic CRUD base class every repository inherits from — implements
the Repository Pattern referenced in the Folder Structure / Coding
Standards docs. Keeps raw SQLAlchemy query code out of the service layer.
"""

from typing import Generic, TypeVar, Type, Optional, List
from uuid import UUID

from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def create(self, obj_in: dict) -> ModelType:
        obj = self.model(**obj_in)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, id: UUID) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def update(self, id: UUID, obj_in: dict) -> Optional[ModelType]:
        obj = self.get(id)
        if not obj:
            return None
        for field, value in obj_in.items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, id: UUID) -> bool:
        obj = self.get(id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
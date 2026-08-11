"""

// backend/app/repositories/custom_word_repository.py
Repository for the CustomWord model — CRUD via BaseRepository, plus a
per-user lookup used both by the Settings page and by processing_task.py
to merge custom words into the detection pipeline (MVP Scope §2).
"""

from uuid import UUID
from typing import List

from app.repositories.base_repository import BaseRepository
from app.models.custom_word import CustomWord


class CustomWordRepository(BaseRepository[CustomWord]):
    def __init__(self, db):
        super().__init__(db, CustomWord)

    def get_by_user(self, user_id: UUID) -> List[CustomWord]:
        return self.db.query(CustomWord).filter(CustomWord.user_id == user_id).all()
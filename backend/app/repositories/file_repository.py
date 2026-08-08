"""

// backend/app/repositories/file_repository.py
Repository for the File model — CRUD via BaseRepository, plus a status/
censored-path update used once censorship completes.
"""

from uuid import UUID
from typing import Optional

from app.repositories.base_repository import BaseRepository
from app.models.file import File


class FileRepository(BaseRepository[File]):
    def __init__(self, db):
        super().__init__(db, File)

    def update_censorship_result(self, file_id: UUID, censored_storage_path: str, status: str = "done") -> Optional[File]:
        file = self.get(file_id)
        if not file:
            return None
        file.censored_storage_path = censored_storage_path
        file.status = status
        self.db.commit()
        self.db.refresh(file)
        return file
"""

// backend/app/repositories/job_repository.py
Repository for the Job model — CRUD via BaseRepository, plus
convenience lookups the job orchestration service needs.
"""

from uuid import UUID
from typing import Optional, List

from app.repositories.base_repository import BaseRepository
from app.models.job import Job


class JobRepository(BaseRepository[Job]):
    def __init__(self, db):
        super().__init__(db, Job)

    def get_by_file_id(self, file_id: UUID) -> List[Job]:
        return self.db.query(Job).filter(Job.file_id == file_id).all()

    def update_status(self, job_id: UUID, status: str, error_message: Optional[str] = None) -> Optional[Job]:
        job = self.get(job_id)
        if not job:
            return None
        job.status = status
        if error_message is not None:
            job.error_message = error_message
        self.db.commit()
        self.db.refresh(job)
        return job
        
"""

// backend/app/repositories/detection_repository.py
Repository for the Detection model — CRUD via BaseRepository, plus a bulk
insert used when ingesting a full batch from the AI pipeline in one go.
"""

from uuid import UUID
from typing import List

from app.repositories.base_repository import BaseRepository
from app.models.detection import Detection


class DetectionRepository(BaseRepository[Detection]):
    def __init__(self, db):
        super().__init__(db, Detection)

    def get_by_file_id(self, file_id: UUID) -> List[Detection]:
        return self.db.query(Detection).filter(Detection.file_id == file_id).all()

    def bulk_create(self, file_id: UUID, detections: List[dict]) -> List[Detection]:
        objs = [
            Detection(file_id=file_id, status="active", **d)
            for d in detections
        ]
        self.db.add_all(objs)
        self.db.commit()
        for obj in objs:
            self.db.refresh(obj)
        return objs
"""

// backend/app/services/detection_ingest_service.py
Validates raw detection dicts (as produced by P1's AI pipeline, or mock
data standing in for it) against the locked DetectionCreate contract, then
persists them via DetectionRepository. Raises ValueError on any malformed
detection — this is intentional: silently accepting a malformed detection
would let a schema drift bug slip past unnoticed.
"""

from uuid import UUID
from typing import List

from pydantic import ValidationError

from app.repositories.detection_repository import DetectionRepository
from app.schemas.detection_schema import DetectionCreate


def ingest_detections(db, file_id: UUID, raw_detections: List[dict]):
    validated = []
    for i, raw in enumerate(raw_detections):
        try:
            validated.append(DetectionCreate(**raw).model_dump())
        except ValidationError as e:
            raise ValueError(f"Detection at index {i} failed contract validation: {e}")

    repo = DetectionRepository(db)
    return repo.bulk_create(file_id, validated)
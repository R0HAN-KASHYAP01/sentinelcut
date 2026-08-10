from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.repositories.detection_repository import DetectionRepository
from app.schemas.detection_schema import DetectionResponse, DetectionUpdate

router = APIRouter(prefix="/files", tags=["detections"])
detection_router = APIRouter(prefix="/detections", tags=["detections"])


@router.get("/{file_id}/detections", response_model=List[DetectionResponse])
def list_detections(
    file_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    repo = DetectionRepository(db)
    return repo.get_by_file_id(file_id)


@detection_router.patch("/{detection_id}", response_model=DetectionResponse)
def update_detection(
    detection_id: UUID,
    payload: DetectionUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if payload.status not in ("active", "removed"):
        raise HTTPException(400, "status must be 'active' or 'removed'")

    repo = DetectionRepository(db)
    detection = repo.update_status(detection_id, payload.status)
    if not detection:
        raise HTTPException(404, "Detection not found")
    return detection
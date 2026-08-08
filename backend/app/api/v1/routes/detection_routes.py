from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.repositories.detection_repository import DetectionRepository
from app.schemas.detection_schema import DetectionResponse

router = APIRouter(prefix="/files", tags=["detections"])


@router.get("/{file_id}/detections", response_model=List[DetectionResponse])
def list_detections(
    file_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    repo = DetectionRepository(db)
    return repo.get_by_file_id(file_id)
from fastapi import APIRouter, UploadFile, File as FastAPIFile, Depends
from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.services.file_service import FileService
from app.schemas.file_schema import FileResponse
from app.workers.tasks.regeneration_task import regenerate_censored_file
from uuid import UUID

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db),
):
    service = FileService(db)
    return await service.upload_file(file, current_user.id)


@router.post("/{file_id}/recensor")
def recensor_file(
    file_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    regenerate_censored_file.delay(str(file_id))
    return {"file_id": str(file_id), "status": "queued"}
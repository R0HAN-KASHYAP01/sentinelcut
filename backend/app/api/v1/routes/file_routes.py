from fastapi import APIRouter, UploadFile, File as FastAPIFile, Depends
from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.services.file_service import FileService
from app.schemas.file_schema import FileResponse

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db),
):
    service = FileService(db)
    return await service.upload_file(file, current_user.id)
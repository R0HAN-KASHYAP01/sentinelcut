"""

// backend/app/api/v1/routes/dashboard_routes.py
Dashboard endpoint per MVP Scope §2: "recent files + simple status only."
Deliberately excludes storage/credits widgets and processing-queue
visualization — those are explicitly cut from MVP (Scope §1).
"""

from typing import List

from fastapi import APIRouter, Depends, Query

from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.repositories.file_repository import FileRepository
from app.schemas.file_schema import FileResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/recent-files", response_model=List[FileResponse])
def get_recent_files(
    limit: int = Query(default=20, ge=1, le=100),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    file_repo = FileRepository(db)
    return file_repo.get_recent_by_user(current_user.id, limit=limit)
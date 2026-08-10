from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional

class FileResponse(BaseModel):
    id: UUID
    user_id: UUID
    original_filename: str
    storage_path: str
    censored_storage_path: Optional[str] = None
    file_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
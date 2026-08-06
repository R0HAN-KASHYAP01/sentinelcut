from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class FileResponse(BaseModel):
    id: UUID
    user_id: UUID
    original_filename: str
    storage_path: str
    file_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  # pydantic v2 (was orm_mode in v1)
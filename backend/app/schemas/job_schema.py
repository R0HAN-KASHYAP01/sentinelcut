from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class JobResponse(BaseModel):
    id: UUID
    file_id: UUID
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
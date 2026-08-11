from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class CustomWordCreate(BaseModel):
    word: str


class CustomWordResponse(BaseModel):
    id: UUID
    user_id: UUID
    word: str
    created_at: datetime

    class Config:
        from_attributes = True
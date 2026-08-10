"""

// backend/app/schemas/detection_schema.py
Enforces the LOCKED detection contract (see /schemas/detection.json at repo
root, and MVP Scope §3.5 / Team Plan §2). Any shape change here is a team
decision, not a solo one — P1's pipeline output, this validation layer, and
P3's frontend all depend on this exact shape.
"""

from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class DetectionCreate(BaseModel):
    """Shape P1's AI pipeline must produce, per detection, per MVP Scope §3.5."""
    word: str
    normalized: str
    canonical: str
    language: str
    severity: str
    start: float
    end: float
    source: str
    confidence: float = Field(ge=0.0, le=1.0)
    variants: Optional[List[str]] = []


class DetectionResponse(BaseModel):
    id: UUID
    file_id: UUID
    word: str
    normalized: str
    canonical: str
    language: str
    severity: str
    start: float
    end: float
    source: str
    confidence: float
    variants: Optional[List[str]] = []
    status: str

    class Config:
        from_attributes = True


class DetectionUpdate(BaseModel):
    status: str  # "active" or "removed"
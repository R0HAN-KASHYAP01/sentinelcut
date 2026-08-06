"""
One profanity detection produced by P1's AI pipeline for a given File.

Field names mirror the locked integration contract (Team Plan §2 /
docs/detection-schema.json) as closely as SQL types allow.

status lets the timeline UI (P3) implement accept/remove:
  - "pending"  : detected, not yet reviewed by the user
  - "accepted" : user confirmed it should be censored
  - "removed"  : user marked it as a false positive, skip in export
"""

import uuid
from sqlalchemy import Column, String, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False, index=True)

    word = Column(String, nullable=False)          # raw transcribed word, e.g. "fuuuuck"
    normalized = Column(String, nullable=False)    # after normalization, e.g. "fuck"
    canonical = Column(String, nullable=False)      # dictionary root form
    language = Column(String, nullable=False)       # "english" | "hindi" | "hinglish_abbrev" | ...
    severity = Column(String, nullable=False)        # "low" | "medium" | "high"

    start = Column(Float, nullable=False)  # seconds
    end = Column(Float, nullable=False)    # seconds

    source = Column(String, nullable=False)         # "dictionary" | "regex" | "fuzzy"
    confidence = Column(Float, nullable=False)

    variants = Column(JSON, nullable=True)  # e.g. ["fuuuuck", "f*ck", "f.u.c.k"]

    status = Column(String, nullable=False, default="pending")  # pending | accepted | removed
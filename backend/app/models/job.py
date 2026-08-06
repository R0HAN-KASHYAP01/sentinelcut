"""
One async processing run for a File, driven by Celery (Step 6+).

A File could in theory have more than one Job over time (e.g. if the
user re-processes after editing custom words), so this is a separate
table rather than fields bolted onto File.
"""

import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base_class import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False, index=True)

    # "queued" -> "processing" -> "done" | "failed"
    status = Column(String, nullable=False, default="queued")
    error_message = Column(Text, nullable=True)  # populated only if status == "failed"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
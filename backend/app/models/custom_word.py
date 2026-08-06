"""
A user's custom profanity word, merged into P1's detection call.
"""

import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base_class import Base


class CustomWord(Base):
    __tablename__ = "custom_words"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True)

    word = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
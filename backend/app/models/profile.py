"""
Maps to the EXISTING `profiles` table in Supabase — this table is
already created and populated by Supabase itself (a trigger on
auth.users creates a matching profiles row at signup time), so this
model describes it for SQLAlchemy/Alembic's benefit, but Alembic
should never try to CREATE this table — it already exists.

Columns match exactly what's in Supabase right now:
  id, email, display_name (nullable), created_at
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base_class import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)  # matches auth.users.id
    email = Column(String, nullable=False)
    display_name = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
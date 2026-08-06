"""

// backend/app/db/base_class.py
The single shared SQLAlchemy declarative base.
Every model (Profile, File, Job, Detection, CustomWord) inherits from
this Base — it's what lets SQLAlchemy know these classes map to
database tables, and it's what Alembic inspects to generate migrations.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
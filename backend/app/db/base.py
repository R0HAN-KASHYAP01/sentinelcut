"""

// backend/app/db/base.py
Model registry for Alembic. Imports every model so they register on
Base.metadata. Alembic's env.py imports Base FROM HERE.
"""

from app.db.base_class import Base  # noqa: F401

from app.models.profile import Profile  # noqa: F401
from app.models.file import File  # noqa: F401
from app.models.job import Job  # noqa: F401
from app.models.detection import Detection  # noqa: F401
from app.models.custom_word import CustomWord  # noqa: F401
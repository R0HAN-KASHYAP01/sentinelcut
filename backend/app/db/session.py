"""

// backend/app/db/session.py
SQLAlchemy engine + session factory, plus the get_db() FastAPI
dependency that auth_deps.py (and every other route/service needing
DB access) imports.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency — yields a DB session for the request, always closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
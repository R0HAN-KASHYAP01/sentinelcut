"""

// backend/app/workers/celery_app.py
Celery app configuration.
"""

from celery import Celery

from app.config import settings
from app.db import base  # noqa: F401 — registers ALL models on Base.metadata
                          # before any task runs in this worker process

celery_app = Celery(
    "sentinelcut",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks.processing_task"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)
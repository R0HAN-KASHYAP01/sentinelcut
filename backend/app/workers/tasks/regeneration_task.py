"""

// backend/app/workers/tasks/regeneration_task.py
Re-runs censorship for a file using only its currently-ACTIVE detections.
Triggered when a user accepts/removes detections in the timeline editor
and wants an updated censored export — creates a NEW censored file rather
than overwriting the previous one, so earlier exports remain valid.
"""

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.repositories.file_repository import FileRepository
from app.repositories.detection_repository import DetectionRepository
from app.services.audio_censorship_service import censor_file


@celery_app.task(name="regenerate_censored_file")
def regenerate_censored_file(file_id: str):
    db = SessionLocal()
    try:
        file_repo = FileRepository(db)
        detection_repo = DetectionRepository(db)

        file = file_repo.get(file_id)
        if not file:
            raise ValueError(f"File {file_id} not found")

        all_detections = detection_repo.get_by_file_id(file_id)
        active_detections = [
            {"start": d.start, "end": d.end}
            for d in all_detections
            if d.status == "active"
        ]

        censored_path = censor_file(
            original_storage_path=file.storage_path,
            user_id=str(file.user_id),
            file_type=file.file_type,
            detections=active_detections,
        )
        file_repo.update_censorship_result(file.id, censored_path, status="done")

        return {"file_id": file_id, "censored_path": censored_path, "active_count": len(active_detections)}

    except Exception as e:
        file_repo.update_censorship_result(file_id, None, status="failed")
        raise
    finally:
        db.close()
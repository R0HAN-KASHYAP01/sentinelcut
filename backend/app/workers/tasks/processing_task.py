"""

// backend/app/workers/tasks/processing_task.py
Orchestrates the full AI pipeline call for a given job (System Architecture
Section 5 / Folder Structure rationale).

MOCK_DETECTIONS is a PLACEHOLDER standing in for P1's real Whisper +
detection pipeline output — real integration happens in Step 12. Everything
downstream of detection (validation, DB writes, censorship) is real and
production-shaped already, so swapping the mock for the real pipeline in
Step 12 requires no changes to this file beyond that one substitution.
"""

import time

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.repositories.job_repository import JobRepository
from app.repositories.file_repository import FileRepository
from app.repositories.detection_repository import DetectionRepository
from app.services.detection_ingest_service import ingest_detections
from app.services.audio_censorship_service import censor_file

# Mock detections standing in for P1's real pipeline output, matching the
# exact demo file spec from MVP Scope §5: one English + one Hindi/Hinglish
# sentence, each profane, including one stretched spelling (fuuuuck) and
# one abbreviation (bc). Remove once Step 12 wires in the real pipeline.
MOCK_DETECTIONS = [
    {
        "word": "fuuuuck",
        "normalized": "fuck",
        "canonical": "fuck",
        "language": "english",
        "severity": "high",
        "start": 12.34,
        "end": 12.81,
        "source": "dictionary",
        "confidence": 0.95,
        "variants": ["fuuuuck", "f*ck", "f.u.c.k"],
    },
    {
        "word": "bc",
        "normalized": "bc",
        "canonical": "behen chod",
        "language": "hinglish_abbrev",
        "severity": "high",
        "start": 20.10,
        "end": 20.35,
        "source": "dictionary",
        "confidence": 0.90,
        "variants": ["bc", "b.c", "bc."],
    },
]


@celery_app.task(name="process_file_job")
def process_file_job(job_id: str):
    db = SessionLocal()
    try:
        job_repo = JobRepository(db)
        file_repo = FileRepository(db)
        detection_repo = DetectionRepository(db)

        job = job_repo.get(job_id)
        job_repo.update_status(job_id, "processing")

        # --- PLACEHOLDER (Step 12 will replace this block) ---
        # from sentinelcut_ai.pipeline.processing_pipeline import run_pipeline
        # raw_detections = run_pipeline(file_path)
        time.sleep(1)
        ingest_detections(db, job.file_id, MOCK_DETECTIONS)
        # --- END PLACEHOLDER ---

        # --- Step 8: FFmpeg/PyDub censorship ---
        file = file_repo.get(job.file_id)
        detections = detection_repo.get_by_file_id(job.file_id)
        detection_dicts = [
            {"start": d.start, "end": d.end} for d in detections
        ]

        censored_path = censor_file(
            original_storage_path=file.storage_path,
            user_id=str(file.user_id),
            file_type=file.file_type,
            detections=detection_dicts,
        )
        file_repo.update_censorship_result(file.id, censored_path, status="done")
        # --- End Step 8 ---

        job_repo.update_status(job_id, "done")
        return {"job_id": job_id, "status": "done", "censored_path": censored_path}

    except Exception as e:
        job_repo.update_status(job_id, "failed", error_message=str(e))
        raise
    finally:
        db.close()
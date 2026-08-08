"""

// backend/app/workers/tasks/processing_task.py
Orchestrates the full AI pipeline call for a given job (System Architecture
Section 5 / Folder Structure rationale). This is currently a PLACEHOLDER —
it proves the Celery/Redis queue works end-to-end (pending -> processing ->
done) without yet calling P1's real Whisper + detection pipeline. Real
integration happens in Step 12 once ai-pipeline/ is ready to be imported
and called from here.
"""

import time

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.repositories.job_repository import JobRepository
from app.repositories.file_repository import FileRepository
from app.services.detection_ingest_service import ingest_detections

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
        job = job_repo.get(job_id)

        job_repo.update_status(job_id, "processing")

        # --- PLACEHOLDER ---
        # Real pipeline call goes here in Step 12:
        #   from sentinelcut_ai.pipeline.processing_pipeline import run_pipeline
        #   raw_detections = run_pipeline(file_path)
        #   -> then ingest_detections(db, job.file_id, raw_detections) below
        #   -> trigger FFmpeg/PyDub censorship (Step 8)
        time.sleep(1)
        ingest_detections(db, job.file_id, MOCK_DETECTIONS)
        # --- END PLACEHOLDER ---

        job_repo.update_status(job_id, "done")
        return {"job_id": job_id, "status": "done"}

    except Exception as e:
        job_repo.update_status(job_id, "failed", error_message=str(e))
        raise
    finally:
        db.close()
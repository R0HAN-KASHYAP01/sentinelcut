"""

// backend/app/workers/tasks/processing_task.py
Orchestrates the full AI pipeline call for a given job (System Architecture
Section 5 / Folder Structure rationale).

Step 12: MOCK_DETECTIONS removed — now calls P1's real Whisper + detection
pipeline (ai-pipeline/sentinelcut_ai/pipeline/processing_pipeline.py).
Everything downstream (validation, DB writes, censorship) is unchanged from
the mock-data version, since it was built against the locked contract from
day one.
"""

import os
import tempfile

from sentinelcut_ai.pipeline.processing_pipeline import process_video

from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.config import settings
from app.repositories.job_repository import JobRepository
from app.repositories.file_repository import FileRepository
from app.repositories.detection_repository import DetectionRepository
from app.services.detection_ingest_service import ingest_detections
from app.services.audio_censorship_service import censor_file

from supabase import create_client

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@celery_app.task(name="process_file_job")
def process_file_job(job_id: str):
    db = SessionLocal()
    job_repo = JobRepository(db)
    file_repo = FileRepository(db)
    file_id = None
    try:
        detection_repo = DetectionRepository(db)

        job = job_repo.get(job_id)
        job_repo.update_status(job_id, "processing")

        file = file_repo.get(job.file_id)
        file_id = file.id
        file_repo.update(file.id, {"status": "processing"})

        # --- Step 12: real pipeline call ---
        # Download original to a local temp path — process_video() needs a
        # real file on disk (faster-whisper reads via ffmpeg internally).
        ext = file.file_type.lower()
        with tempfile.TemporaryDirectory() as tmp_dir:
            local_path = os.path.join(tmp_dir, f"input.{ext}")
            file_bytes = supabase.storage.from_("uploads").download(file.storage_path)
            with open(local_path, "wb") as f:
                f.write(file_bytes)

            raw_detections = process_video(
                local_path,
                custom_words=None,   # TODO: wire in custom_words table lookup later
                model_size="small",  # "medium" recommended for Hindi/Hinglish accuracy
                language=None,       # auto-detect
            )
        # --- end pipeline call ---

        ingest_detections(db, job.file_id, raw_detections)

        # --- Censorship (unchanged from Step 8) ---
        detections = detection_repo.get_by_file_id(job.file_id)
        detection_dicts = [
            {"start": d.start, "end": d.end} for d in detections if d.status == "active"
        ]

        censored_path = censor_file(
            original_storage_path=file.storage_path,
            user_id=str(file.user_id),
            file_type=file.file_type,
            detections=detection_dicts,
        )
        file_repo.update_censorship_result(file.id, censored_path, status="done")
        # --- End censorship ---

        job_repo.update_status(job_id, "done")
        return {
            "job_id": job_id,
            "status": "done",
            "censored_path": censored_path,
            "detections_found": len(raw_detections),
        }

    except Exception as e:
        job_repo.update_status(job_id, "failed", error_message=str(e))
        # Mirror regeneration_task.py: make sure the file itself reflects
        # the failure too, since the frontend routes anything that isn't
        # "done"/"failed" to the processing page and would otherwise poll
        # forever with no way to surface the error or let the user retry.
        if file_id is not None:
            file_repo.update(file_id, {"status": "failed"})
        raise
    finally:
        db.close()
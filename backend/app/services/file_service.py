import logging
import uuid
from fastapi import UploadFile, HTTPException
from app.repositories.file_repository import FileRepository
from app.core.constants import ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB
from app.config import settings
from supabase import create_client
from app.repositories.job_repository import JobRepository
from app.models.detection import Detection
from app.models.job import Job
from app.workers.tasks.processing_task import process_file_job

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
logger = logging.getLogger(__name__)

class FileService:
    def __init__(self, db):
        self.repo = FileRepository(db)
        self.job_repo = JobRepository(db)

    async def upload_file(self, upload: UploadFile, user_id: uuid.UUID):
        ext = upload.filename.split(".")[-1].lower()
        if ext not in ALLOWED_FILE_TYPES:  # e.g. {"mp4", "mp3", "wav"}
            raise HTTPException(400, f"Unsupported file type: {ext}")

        contents = await upload.read()
        size_mb = len(contents) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            raise HTTPException(400, f"File exceeds {MAX_FILE_SIZE_MB}MB limit")

        storage_path = f"{user_id}/{uuid.uuid4()}.{ext}"

        supabase.storage.from_("uploads").upload(
            storage_path, contents,
            file_options={"content-type": upload.content_type}
        )

        file_row = self.repo.create({
            "user_id": user_id,
            "original_filename": upload.filename,
            "storage_path": storage_path,
            "file_type": ext,
            "status": "uploaded",
        })
        job_row = self.job_repo.create({
               "file_id": file_row.id,
               "status": "pending",
           })

        process_file_job.delay(str(job_row.id))

        return file_row

    def delete_file(self, file_id: uuid.UUID, user_id: uuid.UUID):
        """
        Delete a file the user owns: its storage object(s), any related
        jobs/detections rows, and finally the file row itself.

        Allowed for any status ("uploaded"/queued, "processing", "done",
        "failed") — there's no processing-in-progress lock in the MVP, so a
        user can delete a file at any point.
        """
        file_row = self.repo.get(file_id)
        if not file_row or str(file_row.user_id) != str(user_id):
            raise HTTPException(404, "File not found")

        # Remove the underlying storage object(s) first. Best-effort: a
        # storage failure shouldn't block the user from clearing the row
        # out of their dashboard, so we log and continue.
        paths_to_remove = [file_row.storage_path]
        if file_row.censored_storage_path:
            paths_to_remove.append(file_row.censored_storage_path)
        try:
            supabase.storage.from_("uploads").remove(paths_to_remove)
        except Exception:
            logger.warning(
                "Failed to remove storage object(s) for file %s", file_id, exc_info=True
            )

        # No ON DELETE CASCADE on jobs.file_id / detections.file_id, so
        # clear those rows first or the FK constraint will block the delete.
        self.db.query(Detection).filter(Detection.file_id == file_id).delete()
        self.db.query(Job).filter(Job.file_id == file_id).delete()

        self.db.delete(file_row)
        self.db.commit()
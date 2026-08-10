import uuid
from fastapi import UploadFile, HTTPException
from app.repositories.file_repository import FileRepository
from app.core.constants import ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB
from app.config import settings
from supabase import create_client
from app.repositories.job_repository import JobRepository
from app.workers.tasks.processing_task import process_file_job

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

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
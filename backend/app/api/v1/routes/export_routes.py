"""

// backend/app/api/v1/routes/export_routes.py
Export endpoints per MVP Scope §2: censored video, transcript (.txt),
detection metadata (.json). Video/audio are served as signed Supabase
Storage URLs (bucket is private); transcript and detections are generated
on demand and returned as downloadable files.
"""

import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse

from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.repositories.file_repository import FileRepository
from app.repositories.detection_repository import DetectionRepository
from app.services.export_service import get_signed_url, generate_transcript_text

router = APIRouter(prefix="/files", tags=["export"])


def _get_file_or_404(file_id: UUID, db):
    file_repo = FileRepository(db)
    file = file_repo.get(file_id)
    if not file:
        raise HTTPException(404, "File not found")
    return file


@router.get("/{file_id}/export/video")
def export_video(
    file_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    file = _get_file_or_404(file_id, db)
    if not file.censored_storage_path:
        raise HTTPException(409, "File has not finished censoring yet")

    url = get_signed_url(file.censored_storage_path)
    return {"url": url, "expires_in_seconds": 3600}


@router.get("/{file_id}/export/transcript")
def export_transcript(
    file_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    _get_file_or_404(file_id, db)
    detection_repo = DetectionRepository(db)
    detections = detection_repo.get_by_file_id(file_id)

    detection_dicts = [
        {
            "word": d.word, "start": d.start, "end": d.end,
            "language": d.language, "severity": d.severity, "status": d.status,
        }
        for d in detections
    ]
    transcript_text = generate_transcript_text(detection_dicts)

    return PlainTextResponse(
        content=transcript_text,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="transcript_{file_id}.txt"'},
    )


@router.get("/{file_id}/export/detections")
def export_detections(
    file_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    _get_file_or_404(file_id, db)
    detection_repo = DetectionRepository(db)
    detections = detection_repo.get_by_file_id(file_id)

    detection_dicts = [
        {
            "id": str(d.id), "word": d.word, "normalized": d.normalized,
            "canonical": d.canonical, "language": d.language, "severity": d.severity,
            "start": d.start, "end": d.end, "source": d.source,
            "confidence": d.confidence, "variants": d.variants, "status": d.status,
        }
        for d in detections
    ]

    return JSONResponse(
        content=detection_dicts,
        headers={"Content-Disposition": f'attachment; filename="detections_{file_id}.json"'},
    )
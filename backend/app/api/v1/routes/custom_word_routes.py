"""

// backend/app/api/v1/routes/custom_word_routes.py
Custom word list management per MVP Scope §2 ("Custom user word list,
merged into detection"). Simple per-user CRUD — list, add, delete.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps.auth_deps import get_current_user
from app.db.session import get_db
from app.repositories.custom_word_repository import CustomWordRepository
from app.schemas.custom_word_schema import CustomWordCreate, CustomWordResponse

router = APIRouter(prefix="/custom-words", tags=["custom-words"])


@router.get("", response_model=List[CustomWordResponse])
def list_custom_words(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    repo = CustomWordRepository(db)
    return repo.get_by_user(current_user.id)


@router.post("", response_model=CustomWordResponse)
def add_custom_word(
    payload: CustomWordCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    word = payload.word.strip().lower()
    if not word:
        raise HTTPException(400, "Word cannot be empty")

    repo = CustomWordRepository(db)
    existing = [w.word for w in repo.get_by_user(current_user.id)]
    if word in existing:
        raise HTTPException(409, "Word already in your custom list")

    return repo.create({"user_id": current_user.id, "word": word})


@router.delete("/{word_id}")
def delete_custom_word(
    word_id: UUID,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    repo = CustomWordRepository(db)
    deleted = repo.delete(word_id)
    if not deleted:
        raise HTTPException(404, "Word not found")
    return {"status": "deleted"}
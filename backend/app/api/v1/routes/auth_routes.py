"""
Auth-related routes.

Deliberately NO /signup, /login, or /logout here — Supabase Auth
handles those directly from the frontend. This file only exposes a
way to confirm who the currently authenticated user is, which is
also your first end-to-end proof that token verification works.
"""

from fastapi import APIRouter, Depends

from app.api.deps.auth_deps import get_current_user
from app.schemas.auth_schema import CurrentUser

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=CurrentUser)
def get_me(current_user: CurrentUser = Depends(get_current_user)):
    """
    Returns the identity extracted from the caller's token.
    """
    return current_user
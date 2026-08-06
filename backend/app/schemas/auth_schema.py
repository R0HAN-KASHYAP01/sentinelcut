"""
Pydantic schemas related to authentication.

Note: no signup/login/password schemas here — Supabase Auth handles
that entirely on the frontend. This file only defines the shape of
"the currently authenticated user," which protected routes return
or depend on.
"""

from pydantic import BaseModel
from typing import Optional


class CurrentUser(BaseModel):
    id: str                      # Supabase user UUID (the "sub" claim)
    email: Optional[str] = None
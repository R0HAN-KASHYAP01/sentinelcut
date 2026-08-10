"""
FastAPI dependency that protects routes requiring a logged-in user.

Includes a defensive "create profile if somehow missing" check —
profiles are normally created automatically by a Supabase trigger at
signup, so in the common case this does nothing. It only acts as a
safety net against a rare race condition (a backend request arriving
before the trigger has finished).
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_token
from app.schemas.auth_schema import CurrentUser
from app.db.session import get_db
from app.models.profile import Profile

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> CurrentUser:
    token = credentials.credentials
    payload = verify_supabase_token(token)

    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identifier.",
        )

    # Safety net only — normally the profiles row already exists
    # thanks to the Supabase trigger.
    if db.get(Profile, user_id) is None:
        db.add(Profile(id=user_id, email=email))
        db.commit()

    return CurrentUser(id=user_id, email=email)
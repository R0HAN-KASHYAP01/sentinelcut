"""
JWT verification for tokens issued by Supabase Auth.

We NEVER create tokens here — Supabase Auth (called from the frontend)
issues them when a user logs in or signs up. This file's only job is
to check that an incoming token is genuine and not expired, then hand
back its payload.

This project uses Supabase's asymmetric "JWT Signing Keys" (ES256),
confirmed from the "alg" field in a real issued token. Verification
therefore uses Supabase's public JWKS endpoint (safe to call — it only
exposes PUBLIC keys, used to check signatures, never to create them)
instead of a shared secret.

PyJWKClient handles fetching + caching the public keys automatically,
and matches the right key by the token's "kid" (key ID) header.
"""

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status

from app.config import settings

_JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"

# cache_keys=True avoids hitting the network on every single request —
# it refetches only when it sees an unfamiliar "kid".
_jwk_client = PyJWKClient(_JWKS_URL, cache_keys=True)


def verify_supabase_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT using Supabase's public
    signing keys (JWKS). Returns the decoded payload on success.
    Raises HTTPException(401) on any failure.
    """
    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],  # covers both EC and RSA asymmetric setups
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )
    except jwt.PyJWKClientError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to verify token signature.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
"""
Entry point for the SentinelCut backend.
Run this with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(
    title="SentinelCut API",
    description="Backend API for AI-powered audio/video profanity censorship",
    version="0.1.0",
)

app.include_router(api_router)


@app.get("/health")
def health_check():
    """
    Simple endpoint to confirm the server is alive.
    """
    return {"status": "ok", "service": "sentinelcut-backend"}
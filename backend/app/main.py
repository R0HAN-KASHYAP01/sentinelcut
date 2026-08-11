"""
Entry point for the SentinelCut backend.
Run this with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router

app = FastAPI(
    title="SentinelCut API",
    description="Backend API for AI-powered audio/video profanity censorship",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health_check():
    """
    Simple endpoint to confirm the server is alive.
    """
    return {"status": "ok", "service": "sentinelcut-backend"}
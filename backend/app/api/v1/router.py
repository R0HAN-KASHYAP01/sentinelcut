"""
backend/app/api/v1/router.py
Aggregates all v1 routers into one, so main.py only imports one thing.
As detection_routes.py, timeline_routes.py, and export_routes.py get
built in later steps, they get registered here too.
"""

from fastapi import APIRouter

from app.api.v1.routes import auth_routes, file_routes, detection_routes

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_routes.router)
api_router.include_router(file_routes.router)
api_router.include_router(detection_routes.router)
api_router.include_router(detection_routes.detection_router) 
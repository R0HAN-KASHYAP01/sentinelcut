from fastapi import APIRouter

from app.api.v1.routes import auth_routes, file_routes, detection_routes, export_routes, dashboard_routes

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_routes.router)
api_router.include_router(file_routes.router)
api_router.include_router(detection_routes.router)
api_router.include_router(detection_routes.detection_router)
api_router.include_router(export_routes.router)
api_router.include_router(dashboard_routes.router)
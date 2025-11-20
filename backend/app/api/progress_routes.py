# app/api/progress_routes.py
from fastapi import APIRouter
from app.models.schemas import (
    UserProgressRequest, SuccessResponse, UserProgressResponse
)
from app.services.progress_service import progress_service

router = APIRouter(prefix="/api", tags=["progress"])


@router.post('/user_progress', response_model=SuccessResponse)
async def update_user_progress(progress: UserProgressRequest):
    """Update user progress in the database"""
    return progress_service.update_user_progress(progress)


@router.get('/user_progress/{user_id}', response_model=UserProgressResponse)
async def get_user_progress(user_id: str):
    """Get user progress from the database"""
    return progress_service.get_user_progress(user_id)

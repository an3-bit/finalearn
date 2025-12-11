# app/api/lesson_routes.py
from fastapi import APIRouter
from app.models.schemas import (
    PlanRequest, LessonRequest, ChartTaskRequest, 
    LessonPlan, LessonContent, ChartTasks
)
from app.services.ai_service import ai_service
from app.services.progress_service import progress_service

router = APIRouter(prefix="/api/generate", tags=["lessons"])


@router.post('/lesson-plan', response_model=LessonPlan)
async def generate_plan(req: PlanRequest):
    """Generate a learning plan for a module"""
    payload = {"action": "generate_plan", "module": req.module, "duration": req.duration}
    result = ai_service.call_gemini_ai(payload)
    
    # Save to database
    progress_service.save_lesson_plan(req.module, req.duration, result)
    
    return result


@router.post('/lesson-content', response_model=LessonContent)
async def generate_lesson(req: LessonRequest):
    """Generate lesson content for a topic"""
    payload = {"action": "generate_lesson", "topic": req.topic}
    result = ai_service.call_gemini_ai(payload)
    
    # Save to database
    progress_service.save_lesson_content(req.topic, result)
    
    return result


@router.post('/chart-instructions', response_model=ChartTasks)
async def generate_chart_tasks(req: ChartTaskRequest):
    """Generate chart tasks for a topic"""
    payload = {"action": "chart_tasks", "topic": req.topic}
    result = ai_service.call_gemini_ai(payload)
    
    # Save to database
    progress_service.save_chart_tasks(req.topic, result)
    
    return result

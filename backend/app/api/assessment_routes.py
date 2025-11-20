# app/api/assessment_routes.py
from fastapi import APIRouter
from app.models.schemas import (
    AssessmentRequest, TradeEvalRequest, ProgressRequest,
    Assessment, TradeEvaluation, ProgressDecision
)
from app.services.ai_service import ai_service
from app.services.progress_service import progress_service

router = APIRouter(prefix="/api", tags=["assessments"])


@router.post('/assessment', response_model=Assessment)
async def generate_assessment(req: AssessmentRequest):
    """Generate assessment for a module"""
    payload = {"action": "assessment", "module": req.module}
    result = ai_service.call_vertex_ai(payload)
    
    # Save to database
    progress_service.save_assessment(req.module, result)
    
    return result


@router.post('/evaluate_trade', response_model=TradeEvaluation)
async def evaluate_trade(req: TradeEvalRequest):
    """Evaluate a trade decision"""
    payload = {
        "action": "evaluate_trade",
        "trade": {
            "pair": req.pair,
            "direction": req.direction,
            "stop_loss": req.stop_loss,
            "take_profit": req.take_profit,
            "reason": req.reason
        }
    }
    return ai_service.call_vertex_ai(payload)


@router.post('/progress_decision', response_model=ProgressDecision)
async def progress_decision(req: ProgressRequest):
    """Make a progress decision for a student"""
    payload = {"action": "progress_decision", "performance": {
        "lesson_scores": req.lesson_scores,
        "assessment_score": req.assessment_score,
        "trade_score": req.trade_score
    }}
    return ai_service.call_vertex_ai(payload)

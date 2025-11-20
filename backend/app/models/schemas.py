# app/models/schemas.py
from pydantic import BaseModel
from typing import List, Optional


# Request schemas
class PlanRequest(BaseModel):
    module: str
    duration: str


class LessonRequest(BaseModel):
    topic: str


class ChartTaskRequest(BaseModel):
    topic: str


class AssessmentRequest(BaseModel):
    module: str


class TradeEvalRequest(BaseModel):
    pair: str
    direction: str
    stop_loss: float
    take_profit: float
    reason: str


class ProgressRequest(BaseModel):
    lesson_scores: List[int]
    assessment_score: int
    trade_score: int


class UserProgressRequest(BaseModel):
    user_id: str
    module: str
    week: int
    day: int
    lesson_completed: bool
    quiz_score: Optional[int] = None
    time_spent: Optional[int] = None


# Response schemas
class Day(BaseModel):
    day: int
    topic: str


class Week(BaseModel):
    week: int
    goal: str
    days: List[Day]


class LessonPlan(BaseModel):
    module: str
    duration: str
    weeks: List[Week]


class LessonStep(BaseModel):
    step: int
    type: str
    content: Optional[str] = None
    questions: Optional[List[str]] = None


class LessonContent(BaseModel):
    topic: str
    steps: List[LessonStep]


class ChartTasks(BaseModel):
    chart_tasks: List[str]


class AssessmentQuestion(BaseModel):
    q: str
    choices: List[str]
    answer: str


class Assessment(BaseModel):
    module: str
    assessment: dict


class TradeEvaluation(BaseModel):
    score: int
    risk_level: str
    feedback: str
    improvements: List[str]


class ProgressDecision(BaseModel):
    decision: str
    reason: str


class UserProgressResponse(BaseModel):
    progress: List[dict]


class StatusResponse(BaseModel):
    status: str
    version: str


class SuccessResponse(BaseModel):
    status: str
    message: str

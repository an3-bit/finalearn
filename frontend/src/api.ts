import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interfaces
export interface PlanRequest {
  module: string;
  duration: string;
}

export interface LessonRequest {
  topic: string;
}

export interface ChartTaskRequest {
  topic: string;
}

export interface AssessmentRequest {
  module: string;
}

export interface TradeEvalRequest {
  pair: string;
  direction: string;
  stop_loss: number;
  take_profit: number;
  reason: string;
}

export interface ProgressRequest {
  lesson_scores: number[];
  assessment_score: number;
  trade_score: number;
}

export interface UserProgressRequest {
  user_id: string;
  module: string;
  week: number;
  day: number;
  lesson_completed: boolean;
  quiz_score?: number;
  time_spent?: number;
}

// Response interfaces
export interface LessonPlan {
  module: string;
  duration: string;
  weeks: Week[];
}

export interface Week {
  week: number;
  goal: string;
  days: Day[];
}

export interface Day {
  day: number;
  topic: string;
}

export interface LessonContent {
  topic: string;
  steps: LessonStep[];
}

export interface LessonStep {
  step: number;
  type: 'concept' | 'example' | 'quiz' | 'application';
  content?: string;
  questions?: string[];
}

export interface ChartTasks {
  chart_tasks: string[];
}

export interface Assessment {
  module: string;
  assessment: {
    questions: AssessmentQuestion[];
  };
}

export interface AssessmentQuestion {
  q: string;
  choices: string[];
  answer: string;
}

export interface TradeEvaluation {
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  feedback: string;
  improvements: string[];
}

export interface ProgressDecision {
  decision: 'repeat' | 'advance_to_demo' | 'advance_to_live';
  reason: string;
}

// API functions
export async function generatePlan(request: PlanRequest): Promise<LessonPlan> {
  const response = await api.post('/api/generate/lesson-plan', request);
  return response.data;
}

export async function generateLesson(request: LessonRequest): Promise<LessonContent> {
  const response = await api.post('/api/generate/lesson-content', request);
  return response.data;
}

export async function generateChartTasks(request: ChartTaskRequest): Promise<ChartTasks> {
  const response = await api.post('/api/generate/chart-instructions', request);
  return response.data;
}

export async function generateAssessment(request: AssessmentRequest): Promise<Assessment> {
  const response = await api.post('/api/assessment', request);
  return response.data;
}

export async function evaluateTrade(request: TradeEvalRequest): Promise<TradeEvaluation> {
  const response = await api.post('/api/evaluate_trade', request);
  return response.data;
}

export async function makeProgressDecision(request: ProgressRequest): Promise<ProgressDecision> {
  const response = await api.post('/api/progress_decision', request);
  return response.data;
}

export async function updateUserProgress(request: UserProgressRequest): Promise<{ status: string; message: string }> {
  const response = await api.post('/api/user_progress', request);
  return response.data;
}

export async function getUserProgress(userId: string): Promise<{ progress: any[] }> {
  const response = await api.get(`/api/user_progress/${userId}`);
  return response.data;
}

# app/services/ai_service.py
import json
import logging
from typing import Any, Dict, Optional
from google.cloud import aiplatform
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.model = None
        self.system_prompt = """
You are the AI Engine for the FinaLearn Forex Training Web App.
Your job is to generate structured learning content, quizzes, chart tasks, and assessments
for African beginner Forex students.

IMPORTANT GLOBAL RULES:
- Always respond in valid JSON only.
- No extra text. No markdown. No explanations.
- Keep all content beginner-friendly and culturally contextual.
- All lessons must be exactly 30 minutes divided into 6 blocks of 5 minutes each.
- All quizzes must have 3–5 questions.
- All chart tasks must reference TradingView charts.
- Keep text concise and practical.
- Avoid hype, profits, or risky language. Promote safe trading only.

##########################################
# 1. MONTHLY LEARNING PLAN GENERATION
##########################################
When you receive:
{
  "action": "generate_plan",
  "module": "{module}",
  "duration": "{duration_in_days_or_weeks}"
}

Respond with:
{
  "module": "{module}",
  "duration": "{duration}",
  "weeks": [
    {
      "week": 1,
      "goal": "clear weekly learning objective",
      "days": [
        { "day": 1, "topic": "topic of the day" },
        { "day": 2, "topic": "topic of the day" }
      ]
    }
  ]
}

Rules:
- Break content progressively from beginner → intermediate → advanced.
- Include African market context (inflation, currency volatility, common local mistakes).

##########################################
# 2. DAILY 30-MINUTE LESSON GENERATION
##########################################
When you receive:
{
  "action": "generate_lesson",
  "topic": "{topic}"
}

Respond with:
{
  "topic": "{topic}",
  "steps": [
    { "step": 1, "type": "concept", "content": "5-min explanation" },
    { "step": 2, "type": "example", "content": "simple example using real market situation" },
    { "step": 3, "type": "quiz", "questions": ["Q1", "Q2", "Q3"] },
    { "step": 4, "type": "concept", "content": "second concept or deeper explanation" },
    { "step": 5, "type": "application", "content": "practical task for learner" },
    { "step": 6, "type": "quiz", "questions": ["Q1", "Q2", "Q3"] }
  ]
}

Rules:
- Explanations must be short (Max 4 sentences each).
- Examples must be simplified (no complex jargon).

##########################################
# 3. CHART TASK GENERATION
##########################################
When you receive:
{
  "action": "chart_tasks",
  "topic": "{topic}"
}

Respond with:
{
  "chart_tasks": [
    "task 1",
    "task 2",
    "task 3"
  ]
}

Rules:
- Tasks must reinforce the lesson topic.
- Tasks must be performable on TradingView.

##########################################
# 4. ASSESSMENT GENERATION (END OF MONTH)
##########################################
When you receive:
{
  "action": "assessment",
  "module": "{module}"
}

Respond with:
{
  "module": "{module}",
  "assessment": {
    "questions": [
      { "q": "question 1", "choices": ["A","B","C","D"], "answer": "A" },
      { "q": "question 2", "choices": ["A","B","C","D"], "answer": "C" }
    ]
  }
}

##########################################
# 5. TRADING DECISION EVALUATION (DEMO ACCOUNT)
##########################################
When you receive:
{
  "action": "evaluate_trade",
  "trade": {
    "pair": "{pair}",
    "direction": "{buy_or_sell}",
    "stop_loss": "{value}",
    "take_profit": "{value}",
    "reason": "{text}"
  }
}

Respond with:
{
  "score": 0-100,
  "risk_level": "low | medium | high",
  "feedback": "short feedback on the trade decision",
  "improvements": [
    "point 1",
    "point 2"
  ]
}

##########################################
# 6. USER PROGRESSION LOGIC
##########################################
You must determine whether the student:
- remains in the current level
- advances to demo trading
- advances to live trading

When you receive:
{
  "action": "progress_decision",
  "performance": {
    "lesson_scores": [numbers],
    "assessment_score": number,
    "trade_score": number
  }
}

Respond with:
{
  "decision": "repeat | advance_to_demo | advance_to_live",
  "reason": "short explanation"
}

##########################################
# END
##########################################

WAIT for the user's input and respond in JSON only.
"""
        self.initialize_vertex_ai()

    def initialize_vertex_ai(self):
        """Initialize Vertex AI if credentials are available"""
        if settings.google_cloud_project:
            try:
                aiplatform.init(
                    project=settings.google_cloud_project, 
                    location=settings.google_cloud_location
                )
                MODEL_NAME = "text-bison@001"
                self.model = aiplatform.TextGenerationModel.from_pretrained(MODEL_NAME)
                logger.info("Vertex AI initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Vertex AI: {e}")
                self.model = None
        else:
            logger.warning("GOOGLE_CLOUD_PROJECT not set. Using mock responses.")
            self.model = None

    def call_vertex_ai(self, action_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Call Vertex AI with the system prompt and user payload"""
        if not self.model:
            logger.warning("Vertex AI not available, returning mock data")
            return self._get_mock_response(action_payload)
        
        try:
            user_content = json.dumps(action_payload)
            prompt = self.system_prompt + "\nUSER_INPUT:\n" + user_content
            
            response = self.model.generate(prompt=prompt, max_output_tokens=800)
            text = response.text if hasattr(response, 'text') else str(response)
            
            try:
                parsed = json.loads(text)
                return parsed
            except Exception as e:
                raise HTTPException(status_code=500, detail={
                    "error": "Vertex AI did not return valid JSON",
                    "raw_response": text,
                    "exception": str(e)
                })
        except Exception as e:
            logger.error(f"Error calling Vertex AI: {e}")
            return self._get_mock_response(action_payload)

    def _get_mock_response(self, action_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Return mock responses for development"""
        action = action_payload.get("action")
        
        if action == "generate_plan":
            return {
                "module": action_payload.get("module", "Metal Trading"),
                "duration": action_payload.get("duration", "30d"),
                "weeks": [
                    {
                        "week": 1,
                        "goal": "Understand fundamentals of metal markets",
                        "days": [
                            {"day": 1, "topic": "Gold market basics"},
                            {"day": 2, "topic": "Supply and demand forces in gold"},
                            {"day": 3, "topic": "Silver market characteristics"},
                            {"day": 4, "topic": "Platinum and palladium overview"},
                            {"day": 5, "topic": "Metal market correlations"}
                        ]
                    },
                    {
                        "week": 2,
                        "goal": "Technical analysis for metals",
                        "days": [
                            {"day": 1, "topic": "Chart patterns in gold"},
                            {"day": 2, "topic": "Support and resistance in metals"},
                            {"day": 3, "topic": "Moving averages for metal trading"},
                            {"day": 4, "topic": "RSI and momentum indicators"},
                            {"day": 5, "topic": "Volume analysis in metal markets"}
                        ]
                    }
                ]
            }
        elif action == "generate_lesson":
            return {
                "topic": action_payload.get("topic", "Gold market basics"),
                "steps": [
                    {"step": 1, "type": "concept", "content": "Gold is considered a safe haven asset that investors turn to during times of economic uncertainty. It has been a store of value for thousands of years. Central banks hold gold reserves as part of their foreign exchange reserves. Understanding gold's role helps in predicting its price movements."},
                    {"step": 2, "type": "example", "content": "During the 2008 financial crisis, gold prices rose from $800 to over $1,900 per ounce as investors fled from risky assets. When COVID-19 hit in 2020, gold again surged as central banks printed money and interest rates fell to zero."},
                    {"step": 3, "type": "quiz", "questions": ["Why is gold considered a safe haven asset?", "What happens to gold prices during economic uncertainty?", "Which institutions hold significant gold reserves?"]},
                    {"step": 4, "type": "concept", "content": "Gold prices are influenced by the US Dollar strength, interest rates, inflation expectations, and geopolitical events. When the dollar weakens, gold typically rises since it's priced in USD. Lower interest rates make gold more attractive since it doesn't pay interest."},
                    {"step": 5, "type": "application", "content": "Open a gold chart (XAUUSD) and identify the last major trend. Look for periods when the price moved up or down significantly. Try to correlate these moves with major economic events or dollar strength/weakness periods."},
                    {"step": 6, "type": "quiz", "questions": ["What happens to gold when the US Dollar strengthens?", "How do interest rates affect gold prices?", "Name two factors that can drive gold prices higher."]}
                ]
            }
        elif action == "chart_tasks":
            return {
                "chart_tasks": [
                    "Open XAUUSD 1H chart and identify the current trend direction",
                    "Mark the last major support and resistance levels on the daily chart",
                    "Check the correlation between gold and USDX (Dollar Index) over the past week"
                ]
            }
        elif action == "assessment":
            return {
                "module": action_payload.get("module", "Metal Trading"),
                "assessment": {
                    "questions": [
                        {"q": "What is the primary reason gold is considered a safe haven?", "choices": ["High volatility", "Store of value", "High returns", "Easy to trade"], "answer": "Store of value"},
                        {"q": "When the US Dollar strengthens, gold prices typically:", "choices": ["Rise", "Fall", "Stay the same", "Become more volatile"], "answer": "Fall"},
                        {"q": "Which factor does NOT directly affect gold prices?", "choices": ["Interest rates", "Dollar strength", "Stock market performance", "Copper demand"], "answer": "Copper demand"}
                    ]
                }
            }
        elif action == "evaluate_trade":
            return {
                "score": 75,
                "risk_level": "medium",
                "feedback": "Good analysis of market conditions, but consider tighter stop loss",
                "improvements": [
                    "Use smaller position size for better risk management",
                    "Consider economic calendar events before entering trades"
                ]
            }
        elif action == "progress_decision":
            return {
                "decision": "advance_to_demo",
                "reason": "Strong understanding demonstrated with consistent quiz scores above 80%"
            }
        
        return {"error": "Unknown action"}


# Global AI service instance
ai_service = AIService()

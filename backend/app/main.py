# app/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.utils.database import db_manager
from app.api.lesson_routes import router as lesson_router
from app.api.assessment_routes import router as assessment_router
from app.api.progress_routes import router as progress_router
from app.models.schemas import StatusResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="AI-Powered Forex Training Backend for African Beginners"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lesson_router)
app.include_router(assessment_router)
app.include_router(progress_router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Starting FinaLearn AI Backend...")
    success = db_manager.init_database()
    if success:
        logger.info("Database initialized successfully")
    else:
        logger.error("Failed to initialize database")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down FinaLearn AI Backend...")


@app.get('/', response_model=StatusResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "FinaLearn AI Backend is running", 
        "version": settings.api_version
    }


@app.get('/health', response_model=StatusResponse)
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy", 
        "version": settings.api_version
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level="info"
    )
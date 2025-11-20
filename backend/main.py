# main.py - Entry point for the FinaLearn AI Backend
from app.app import app

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    
    uvicorn.run(
        "app.app:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level="info"
    )

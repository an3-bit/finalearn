# FinaLearn AI Backend

FastAPI backend for the FinaLearn Forex Training Web App with Vertex AI integration and MySQL database.

## Features

- **Vertex AI Integration**: Generates structured learning content using Google Cloud's Vertex AI
- **MySQL Database**: Stores user progress, lesson plans, and cached AI responses
- **RESTful API**: Clean endpoints for frontend communication
- **Mock Responses**: Fallback mock data when Vertex AI is unavailable
- **CORS Support**: Configured for frontend development

## Requirements

- Python 3.10+
- MySQL 8.0+
- Google Cloud Project with Vertex AI enabled (optional for development)

## Setup

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up MySQL database**:
   ```bash
   # Create database
   mysql -u root -p < ../database/init.sql
   ```

6. **Configure Google Cloud (Optional)**:
   ```bash
   # For production with Vertex AI
   gcloud auth application-default login
   # Or set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   ```

## Environment Variables

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Database Configuration
DB_HOST=localhost
DB_NAME=finalearn
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306

# Server Configuration
PORT=8000
```

## Running the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Lesson Management
- `POST /api/generate/lesson-plan` - Generate learning plan for a module
- `POST /api/generate/lesson-content` - Generate 30-minute lesson content
- `POST /api/generate/chart-instructions` - Generate chart-based tasks

### Assessment
- `POST /api/assessment` - Generate module assessments
- `POST /api/evaluate_trade` - Evaluate trading decisions
- `POST /api/progress_decision` - Make student progression decisions

### User Progress
- `POST /api/user_progress` - Update user learning progress
- `GET /api/user_progress/{user_id}` - Get user progress history

## API Usage Examples

### Generate Learning Plan
```bash
curl -X POST "http://localhost:8000/api/generate/lesson-plan" \
     -H "Content-Type: application/json" \
     -d '{"module": "Metal Trading", "duration": "30d"}'
```

### Generate Lesson Content
```bash
curl -X POST "http://localhost:8000/api/generate/lesson-content" \
     -H "Content-Type: application/json" \
     -d '{"topic": "Gold market basics"}'
```

### Update User Progress
```bash
curl -X POST "http://localhost:8000/api/user_progress" \
     -H "Content-Type: application/json" \
     -d '{"user_id": "1", "module": "Metal Trading", "week": 1, "day": 1, "lesson_completed": true, "quiz_score": 85, "time_spent": 1800}'
```

## Database Schema

The backend uses MySQL with the following main tables:
- `users` - User accounts
- `lesson_plans` - Generated learning plans
- `user_progress` - Student progress tracking
- `lesson_content` - Cached AI-generated lessons
- `chart_tasks` - Cached chart instructions
- `assessments` - Module assessments
- `quiz_responses` - User quiz answers
- `trade_evaluations` - Trade decision evaluations

## Development Notes

- The app includes mock responses for development when Vertex AI is not configured
- All AI responses are cached in the database to reduce API calls
- CORS is configured for React development servers on ports 3000 and 3001
- Database tables are auto-created on first run

## Production Deployment

1. Set up Google Cloud service account with Vertex AI permissions
2. Configure production database
3. Set environment variables
4. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

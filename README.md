# FinaLearn AI - Forex Training Web App

A complete AI-powered Forex trading education platform built with FastAPI (backend) and React TypeScript (frontend). Designed specifically for African beginner traders with culturally relevant content and safe trading practices.

![FinaLearn Architecture](https://via.placeholder.com/800x400/667eea/ffffff?text=FinaLearn+AI+Architecture)

## 🌟 Features

### 🎯 **AI-Powered Learning**
- **Google Vertex AI Integration**: Generates personalized learning content
- **Structured 30-minute Lessons**: Divided into 6×5-minute learning segments
- **Cultural Context**: Content adapted for African markets and economic conditions
- **Progressive Learning**: Beginner → Intermediate → Advanced pathways

### 📚 **Interactive Learning System**
- **Module-based Curriculum**: Metal Trading, Currency Pairs, Technical Analysis, etc.
- **Real-time Lesson Timer**: Automatic progression through lesson segments
- **Interactive Quizzes**: Built-in assessments after each concept
- **Chart Practice**: Integration with TradingView for hands-on experience

### 📊 **Progress Tracking**
- **MySQL Database**: Stores user progress, quiz scores, and learning analytics
- **Visual Dashboard**: Track completion rates, scores, and study time
- **Performance Insights**: AI-powered recommendations for improvement
- **Module Completion**: Assessments to unlock advanced content

### 🔄 **Student Learning Flow**

```
1. Select Module (e.g., "Metal Trading")
   ↓
2. AI Generates 30-day Learning Plan
   ↓ 
3. Daily 30-minute Lessons (6×5min segments)
   ↓
4. Interactive Quizzes & Concept Reinforcement  
   ↓
5. Chart Practice with TradingView
   ↓
6. Module Assessment & Progress Decision
   ↓
7. Advance to Demo Trading → Live Trading
```

## 🏗️ **Architecture**

### Backend (FastAPI + Vertex AI + MySQL)
```
📁 backend/
├── main.py              # FastAPI server with all endpoints
├── requirements.txt     # Python dependencies
├── .env.example        # Environment configuration
└── README.md           # Backend documentation

📁 database/
└── init.sql            # MySQL database schema
```

### Frontend (React + TypeScript)
```
📁 frontend/
├── src/
│   ├── components/     # React components
│   ├── api.ts         # API client & interfaces  
│   ├── App.tsx        # Main app with routing
│   └── App.css        # Responsive styling
├── package.json       # Node.js dependencies
└── README.md          # Frontend documentation
```

## 🚀 **Quick Start**

### Prerequisites
- **Python 3.10+**
- **Node.js 16+** 
- **MySQL 8.0+**
- **Google Cloud Project** (optional, uses mock data otherwise)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd finalearn-ai
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p < database/init.sql
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database and Google Cloud settings

# Start backend server
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Configure environment  
cp .env.example .env

# Start development server
npm start
```

### 5. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 **Configuration**

### Backend Environment Variables
```env
# Google Cloud (Optional - uses mock data if not configured)
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

### Frontend Environment Variables
```env
REACT_APP_API_BASE=http://localhost:8000
```

## 📡 **API Endpoints**

### Learning Content Generation
- `POST /api/generate/lesson-plan` - Generate monthly learning plans
- `POST /api/generate/lesson-content` - Create 30-minute lessons
- `POST /api/generate/chart-instructions` - Generate chart practice tasks

### Assessment & Evaluation  
- `POST /api/assessment` - Generate module assessments
- `POST /api/evaluate_trade` - Evaluate trading decisions
- `POST /api/progress_decision` - Determine student advancement

### Progress Management
- `POST /api/user_progress` - Update learning progress
- `GET /api/user_progress/{user_id}` - Retrieve progress history

## 🎓 **Learning Modules**

1. **Metal Trading** - Gold, Silver, Platinum fundamentals
2. **Currency Pairs** - Major, Minor, and Exotic pairs
3. **Technical Analysis** - Charts, indicators, patterns
4. **Fundamental Analysis** - Economic factors, news trading
5. **Risk Management** - Position sizing, stop losses
6. **Trading Psychology** - Emotional control, discipline

## 🛡️ **Safe Trading Principles**

- **No Hype Language**: Focuses on education over profits
- **Risk Awareness**: Emphasizes proper risk management
- **Demo First**: Requires demo trading before live accounts
- **African Context**: Addresses local economic challenges
- **Gradual Progression**: Structured advancement through skill levels

## 🔮 **AI System Prompt**

The backend uses a comprehensive system prompt that ensures:
- **JSON-only responses** for structured data
- **Beginner-friendly content** with cultural context
- **30-minute lesson structure** (6×5min segments)
- **3-5 question quizzes** for assessment
- **TradingView chart integration** for practical tasks
- **Safe trading practices** throughout all content

## 🗄️ **Database Schema**

Key tables:
- `users` - User accounts and authentication
- `lesson_plans` - AI-generated learning plans  
- `user_progress` - Lesson completion and scores
- `lesson_content` - Cached AI-generated lessons
- `assessments` - Module assessments and results
- `trade_evaluations` - Trading decision analysis

## 🚀 **Production Deployment**

### Backend Deployment
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files with any web server
# (Nginx, Apache, Netlify, Vercel, etc.)
```

### Google Cloud Setup
```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Or use service account
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## 📱 **Mobile Responsiveness**

- ✅ Responsive design works on all device sizes
- ✅ Touch-friendly interface for mobile learning
- ✅ Optimized chart viewing on tablets
- ✅ Mobile-first CSS design approach

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Check the README files in `/backend` and `/frontend`
- **Issues**: Open GitHub issues for bugs and feature requests
- **API Documentation**: Visit `/docs` endpoint on running backend

## 🏆 **Future Enhancements**

- [ ] Real-time TradingView widget integration
- [ ] User authentication and authorization  
- [ ] Social learning features and leaderboards
- [ ] Mobile app (React Native)
- [ ] Advanced chart drawing tools
- [ ] Multilingual support for African languages
- [ ] Integration with real broker demo accounts
- [ ] AI-powered personalized learning paths

---

**FinaLearn AI** - Empowering African traders with AI-driven education and safe trading practices. 🌍📈

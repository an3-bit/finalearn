# FinaLearn Frontend

React TypeScript frontend for the FinaLearn Forex Trading Education platform.

## Features

- **Modern React App**: Built with React 18 and TypeScript
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Learning**: 30-minute lessons with 5-minute segments and timers
- **Chart Integration**: TradingView chart integration for hands-on practice
- **Progress Tracking**: Visual progress tracking and statistics
- **Assessment System**: Interactive quizzes and module assessments
- **Real-time Updates**: Live lesson timers and progress indicators

## Requirements

- Node.js 16+
- npm or yarn

## Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env if needed (default backend URL is http://localhost:8000)
   ```

4. **Start development server**:
   ```bash
   npm start
   # or
   yarn start
   ```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard with module selection
│   ├── LessonPlayer.tsx # 30-minute lesson player with timer
│   ├── LessonCard.tsx   # Individual lesson cards
│   ├── ChartView.tsx    # Chart practice with TradingView
│   ├── AssessmentView.tsx # Module assessments
│   ├── ProgressView.tsx # Progress tracking and statistics
│   └── Header.tsx       # Navigation header
├── api.ts              # API client and interfaces
├── App.tsx             # Main app component with routing
├── App.css             # Styles and responsive design
└── index.tsx           # App entry point
```

## Key Components

### Dashboard
- Module selection (Metal Trading, Currency Pairs, etc.)
- Learning plan generation
- Week and day overview with lesson cards

### Lesson Player
- 30-minute lessons divided into 6×5-minute segments
- Automatic timer progression
- Interactive quizzes with text inputs
- Progress tracking and completion

### Chart View
- Integration with TradingView charts
- Task-based learning exercises
- Checklist for completing chart analysis tasks
- Mock chart visualization for development

### Assessment View
- Multiple-choice questions
- Automatic scoring
- Detailed results with correct/incorrect breakdown
- Progress recommendations

### Progress View
- Overall statistics dashboard
- Module-by-module progress
- Detailed lesson history
- Performance insights and recommendations

## Environment Variables

```env
REACT_APP_API_BASE=http://localhost:8000
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## API Integration

The frontend communicates with the FastAPI backend through:

- `POST /api/generate/lesson-plan` - Generate learning plans
- `POST /api/generate/lesson-content` - Get 30-minute lessons
- `POST /api/generate/chart-instructions` - Get chart tasks
- `POST /api/assessment` - Get module assessments
- `POST /api/user_progress` - Update learning progress
- `GET /api/user_progress/{user_id}` - Get progress history

## Styling

The app uses custom CSS with:
- CSS Grid and Flexbox for responsive layouts
- CSS variables for consistent theming
- Gradient backgrounds and modern UI elements
- Mobile-first responsive design
- Smooth transitions and hover effects

## TradingView Integration

The app is set up to integrate with TradingView widgets:
- Chart container ready for TradingView embedding
- Mock chart for development/preview
- Task-based learning integrated with chart analysis

## Development Notes

- Uses React Router for navigation
- TypeScript for type safety
- Axios for API calls
- Responsive design with CSS Grid/Flexbox
- Mock data fallbacks for development
- Progress persistence through backend API

## Production Build

```bash
npm run build
```

The build folder will contain the production-ready static files that can be served by any web server.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Real TradingView widget integration
- User authentication
- Offline lesson caching
- Push notifications for lesson reminders
- Social features and leaderboards
- Advanced chart drawing tools integration

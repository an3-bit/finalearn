import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProgress } from '../api';

interface Props {
  userId: string;
}

interface LessonPlan {
  id?: string;
  title: string;
  module: string;
  duration: string;
  weeks: Week[];
  created_at?: string;
}

interface Week {
  week: number;
  theme: string;
  days: Day[];
}

interface Day {
  day: number;
  topic: string;
  content: string;
  activities: string[];
  quiz_questions: QuizQuestion[];
  estimated_time: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface ModuleData {
  name: string;
  icon?: string;
  description: string;
  level: string;
  duration: string;
  color: string;
  image?: string;
}

interface ProgressData {
  id: number;
  module: string;
  week: number;
  day: number;
  topic: string;
  lesson_completed: boolean;
  quiz_score: number | null;
  time_spent: number | null;
  completed_at: string | null;
}

const ProgressView: React.FC<Props> = ({ userId }) => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [selectedModuleData, setSelectedModuleData] = useState<ModuleData | null>(null);
  const [activeView, setActiveView] = useState<'plan' | 'progress'>('plan');

  useEffect(() => {
    // Check for generated plan in localStorage
    const planData = localStorage.getItem('generatedPlan');
    const moduleData = localStorage.getItem('selectedModuleData');
    
    console.log('ProgressView - Plan data from localStorage:', planData);
    console.log('ProgressView - Module data from localStorage:', moduleData);
    
    if (planData && moduleData) {
      try {
        const parsedPlan = JSON.parse(planData);
        const parsedModule = JSON.parse(moduleData);
        
        console.log('ProgressView - Parsed plan:', parsedPlan);
        console.log('ProgressView - Parsed module:', parsedModule);
        
        setGeneratedPlan(parsedPlan);
        setSelectedModuleData(parsedModule);
        setActiveView('plan');
      } catch (error) {
        console.error('ProgressView - Error parsing localStorage data:', error);
        setActiveView('progress');
      }
    } else {
      console.log('ProgressView - No plan/module data found, showing progress view');
      setActiveView('progress');
    }
    
    loadProgressData();
  }, [userId]);

  const loadProgressData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserProgress(userId);
      setProgressData(response.progress);
    } catch (err) {
      setError('Failed to load progress data. Please try again.');
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueModules = (): string[] => {
    const modules = progressData.map(item => item.module);
    return ['all', ...Array.from(new Set(modules))];
  };

  const filteredProgress = selectedModule === 'all' 
    ? progressData 
    : progressData.filter(item => item.module === selectedModule);

  const getOverallStats = () => {
    const completed = progressData.filter(item => item.lesson_completed).length;
    const total = progressData.length;
    const avgScore = progressData
      .filter(item => item.quiz_score !== null)
      .reduce((sum, item, _, arr) => sum + (item.quiz_score || 0) / arr.length, 0);
    const totalTime = progressData
      .filter(item => item.time_spent !== null)
      .reduce((sum, item) => sum + (item.time_spent || 0), 0);

    return {
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageScore: Math.round(avgScore),
      totalTimeHours: Math.round(totalTime / 3600 * 10) / 10,
      lessonsCompleted: completed,
      totalLessons: total
    };
  };

  const getModuleStats = (module: string) => {
    const moduleData = progressData.filter(item => item.module === module);
    const completed = moduleData.filter(item => item.lesson_completed).length;
    const total = moduleData.length;
    
    return {
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="progress-view loading">
        <div className="loading-spinner">Loading progress data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-view error">
        <div className="error-message">{error}</div>
        <button onClick={loadProgressData}>Retry</button>
      </div>
    );
  }

  const stats = getOverallStats();
  const modules = getUniqueModules();

  const clearGeneratedPlan = () => {
    localStorage.removeItem('generatedPlan');
    localStorage.removeItem('selectedModuleData');
    setGeneratedPlan(null);
    setSelectedModuleData(null);
    setActiveView('progress');
  };

  const startLearning = (weekIndex: number, dayIndex: number) => {
    const week = generatedPlan?.weeks[weekIndex];
    const day = week?.days?.[dayIndex];
    
    if (day && day.topic) {
      // Store the lesson data in localStorage for the lesson player
      const lessonData = {
        topic: day.topic,
        content: day.content,
        activities: day.activities || [],
        quiz_questions: day.quiz_questions || [],
        estimated_time: day.estimated_time || 0,
        week: week.week,
        day: day.day,
        module: generatedPlan?.module || selectedModuleData?.name || 'Unknown'
      };
      
      localStorage.setItem('currentLesson', JSON.stringify(lessonData));
      
      // Navigate to the lesson player with the topic as parameter
      navigate(`/lesson/${encodeURIComponent(day.topic)}`);
    } else {
      console.error('Invalid lesson data');
      alert('Unable to start lesson. Invalid lesson data.');
    }
  };

  return (
    <div className="progress-view">
      {/* Navigation Tabs */}
      <div className="progress-navigation">
        {generatedPlan && (
          <button 
            className={`nav-tab ${activeView === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveView('plan')}
          >
            📚 Your Learning Path
          </button>
        )}
        <button 
          className={`nav-tab ${activeView === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveView('progress')}
        >
          📊 Progress Tracking
        </button>
      </div>

      {/* Generated Learning Plan View */}
      {activeView === 'plan' && generatedPlan && selectedModuleData && (
        <div className="learning-plan-view">
          {/* Hero Section */}
          <div 
            className="plan-hero"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`
            }}
          >
            <div className="hero-content">
              <h1>🎯 Your Personalized Learning Path</h1>
              <div className="plan-meta">
                <span className="plan-module">{selectedModuleData.name}</span>
                <span className="plan-duration">{generatedPlan.duration} Journey</span>
                <span className="plan-level">{selectedModuleData.level}</span>
              </div>
              <p className="plan-description">{selectedModuleData.description}</p>
              <button className="clear-plan-btn" onClick={clearGeneratedPlan}>
                🔄 Generate New Path
              </button>
            </div>
          </div>

          {/* Learning Path Content */}
          <div className="plan-content">
            <div className="plan-overview">
              <h2>📋 Learning Overview</h2>
              <div className="overview-stats">
                <div className="overview-stat">
                  <span className="stat-number">{generatedPlan.weeks?.length || 0}</span>
                  <span className="stat-label">Weeks</span>
                </div>
                <div className="overview-stat">
                  <span className="stat-number">
                    {generatedPlan.weeks.reduce((total, week) => total + (week.days?.length || 0), 0)}
                  </span>
                  <span className="stat-label">Lessons</span>
                </div>
                <div className="overview-stat">
                  <span className="stat-number">
                    {Math.round(generatedPlan.weeks.reduce((total, week) => 
                      total + (week.days?.reduce((dayTotal, day) => dayTotal + (day.estimated_time || 0), 0) || 0), 0) / 60)}
                  </span>
                  <span className="stat-label">Hours</span>
                </div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="weeks-container">
              {generatedPlan.weeks?.map((week, weekIndex) => (
                <div key={week.week} className="week-card">
                  <div className="week-header">
                    <h3>Week {week.week}: {week.theme}</h3>
                    <div className="week-progress">
                      <span>{week.days?.length || 0} lessons</span>
                    </div>
                  </div>
                  
                  <div className="days-grid">
                    {week.days?.map((day, dayIndex) => (
                      <div key={day.day} className="day-card">
                        <div className="day-header">
                          <span className="day-number">Day {day.day || 'N/A'}</span>
                          <span className="day-time">{day.estimated_time || 0} min</span>
                        </div>
                        
                        <h4 className="day-topic">{day.topic}</h4>
                        <p className="day-content">{day.content ? day.content.substring(0, 150) : 'No content available'}...</p>
                        
                        <div className="day-activities">
                          <h5>🎯 Activities ({day.activities?.length || 0}):</h5>
                          <ul>
                            {day.activities?.slice(0, 2).map((activity, index) => (
                              <li key={index}>{activity}</li>
                            )) || <li>No activities available</li>}
                            {day.activities && day.activities.length > 2 && (
                              <li>...and {day.activities.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="day-quiz">
                          <span className="quiz-count">📝 {day.quiz_questions?.length || 0} quiz questions</span>
                        </div>
                        
                        <button 
                          className="start-lesson-btn"
                          onClick={() => startLearning(weekIndex, dayIndex)}
                        >
                          🚀 Start Lesson
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Tips */}
            <div className="learning-tips">
              <div 
                className="tips-section"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(74, 144, 226, 0.9), rgba(80, 200, 120, 0.8)), url('https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`
                }}
              >
                <h3>💡 Learning Tips for Success</h3>
                <div className="tips-grid">
                  <div className="tip-card">
                    <div className="tip-icon">⏰</div>
                    <h4>Consistent Schedule</h4>
                    <p>Dedicate the same time each day for maximum retention</p>
                  </div>
                  <div className="tip-card">
                    <div className="tip-icon">📝</div>
                    <h4>Take Notes</h4>
                    <p>Write down key concepts and practice with examples</p>
                  </div>
                  <div className="tip-card">
                    <div className="tip-icon">🎯</div>
                    <h4>Practice Daily</h4>
                    <p>Apply what you learn with demo trading platforms</p>
                  </div>
                  <div className="tip-card">
                    <div className="tip-icon">🤝</div>
                    <h4>Join Community</h4>
                    <p>Connect with other learners for support and insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tracking View */}
      {activeView === 'progress' && (
        <div className="progress-tracking-view">
          <div className="progress-header">
            <h2>Your Learning Progress</h2>
            <p>Track your journey through FinaLearn's forex education program</p>
          </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{stats.lessonsCompleted}</div>
          <div className="stat-label">Lessons Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.averageScore}%</div>
          <div className="stat-label">Average Quiz Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalTimeHours}h</div>
          <div className="stat-label">Total Study Time</div>
        </div>
      </div>

      <div className="module-filter">
        <label htmlFor="module-select">Filter by Module:</label>
        <select 
          id="module-select"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          {modules.map(module => (
            <option key={module} value={module}>
              {module === 'all' ? 'All Modules' : module}
            </option>
          ))}
        </select>
      </div>

      <div className="modules-progress">
        {modules.slice(1).map(module => {
          const moduleStats = getModuleStats(module);
          return (
            <div key={module} className="module-progress-card">
              <div className="module-header">
                <h3>{module}</h3>
                <div className="module-completion">
                  {moduleStats.completed} / {moduleStats.total} lessons
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${moduleStats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="detailed-progress">
        <h3>Detailed Progress</h3>
        {filteredProgress.length === 0 ? (
          <div className="no-progress">
            <p>No progress data available yet.</p>
            <p>Start learning to see your progress here!</p>
          </div>
        ) : (
          <div className="progress-table">
            <div className="table-header">
              <div>Module</div>
              <div>Week</div>
              <div>Day</div>
              <div>Topic</div>
              <div>Status</div>
              <div>Quiz Score</div>
              <div>Time Spent</div>
              <div>Completed</div>
            </div>
            {filteredProgress.map((item) => (
              <div key={item.id} className="table-row">
                <div>{item.module}</div>
                <div>Week {item.week}</div>
                <div>Day {item.day}</div>
                <div>{item.topic || 'N/A'}</div>
                <div>
                  <span className={`status-badge ${item.lesson_completed ? 'completed' : 'pending'}`}>
                    {item.lesson_completed ? '✅ Completed' : '⏳ Pending'}
                  </span>
                </div>
                <div>
                  {item.quiz_score !== null ? `${item.quiz_score}%` : 'N/A'}
                </div>
                <div>
                  {item.time_spent !== null ? formatTime(item.time_spent) : 'N/A'}
                </div>
                <div>
                  {item.completed_at ? formatDate(item.completed_at) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="progress-insights">
        <h3>Insights & Recommendations</h3>
        <div className="insights-grid">
          {stats.averageScore >= 80 ? (
            <div className="insight-card positive">
              <h4>🌟 Excellent Performance!</h4>
              <p>Your average quiz score of {stats.averageScore}% shows strong understanding. Keep it up!</p>
            </div>
          ) : stats.averageScore >= 60 ? (
            <div className="insight-card neutral">
              <h4>📚 Good Progress</h4>
              <p>You're doing well with {stats.averageScore}% average. Consider reviewing challenging topics.</p>
            </div>
          ) : (
            <div className="insight-card negative">
              <h4>💪 Keep Learning</h4>
              <p>Focus on understanding core concepts. Don't hesitate to revisit lessons.</p>
            </div>
          )}
          
          {stats.completionRate >= 80 ? (
            <div className="insight-card positive">
              <h4>🚀 Great Consistency</h4>
              <p>You've completed {stats.completionRate}% of your lessons. Excellent dedication!</p>
            </div>
          ) : (
            <div className="insight-card neutral">
              <h4>⏰ Stay Consistent</h4>
              <p>Try to complete lessons regularly to maintain momentum in your learning journey.</p>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default ProgressView;

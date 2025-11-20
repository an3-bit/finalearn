import React, { useState, useEffect } from 'react';
import { getUserProgress } from '../api';

interface Props {
  userId: string;
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
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
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

  return (
    <div className="progress-view">
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
  );
};

export default ProgressView;

import React, { useState, useEffect } from 'react';
import { generatePlan, LessonPlan } from '../api';
import LessonCard from './LessonCard';

interface Props {
  userId: string;
}

const Dashboard: React.FC<Props> = ({ userId }) => {
  const [selectedModule, setSelectedModule] = useState('Metal Trading');
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules = [
    'Metal Trading',
    'Currency Pairs',
    'Technical Analysis',
    'Fundamental Analysis',
    'Risk Management',
    'Trading Psychology'
  ];

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await generatePlan({
        module: selectedModule,
        duration: '30d'
      });
      setPlan(newPlan);
    } catch (err) {
      setError('Failed to generate lesson plan. Please try again.');
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome to FinaLearn</h2>
        <p>Select a module to begin your Forex trading journey</p>
      </div>

      <div className="module-selection">
        <div className="input-group">
          <label htmlFor="module-select">Choose a Module:</label>
          <select 
            id="module-select"
            value={selectedModule} 
            onChange={(e) => setSelectedModule(e.target.value)}
            className="module-select"
          >
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleGeneratePlan} 
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generating Plan...' : 'Generate Learning Plan'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {plan && (
        <div className="lesson-plan">
          <h3>{plan.module} - {plan.duration}</h3>
          <div className="weeks-grid">
            {plan.weeks.map((week) => (
              <div key={week.week} className="week-card">
                <h4>Week {week.week}</h4>
                <p className="week-goal">{week.goal}</p>
                <div className="days-list">
                  {week.days.map((day) => (
                    <LessonCard 
                      key={`${week.week}-${day.day}`}
                      day={day}
                      week={week.week}
                      module={plan.module}
                      userId={userId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!plan && !loading && (
        <div className="welcome-message">
          <h3>Get Started</h3>
          <p>Select a module above and click "Generate Learning Plan" to begin your personalized Forex education journey.</p>
          <div className="features">
            <div className="feature">
              <h4>🎯 Structured Learning</h4>
              <p>30-minute daily lessons broken into 5-minute segments</p>
            </div>
            <div className="feature">
              <h4>📊 Interactive Charts</h4>
              <p>Real-time TradingView charts for hands-on practice</p>
            </div>
            <div className="feature">
              <h4>🧠 AI-Powered Content</h4>
              <p>Personalized content adapted for African markets</p>
            </div>
            <div className="feature">
              <h4>📈 Progress Tracking</h4>
              <p>Monitor your learning journey and quiz scores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

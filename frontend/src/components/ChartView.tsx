import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateChartTasks, ChartTasks } from '../api';

const ChartView: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const [chartTasks, setChartTasks] = useState<ChartTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([]);

  useEffect(() => {
    if (topic) {
      loadChartTasks(decodeURIComponent(topic));
    }
  }, [topic]);

  const loadChartTasks = async (topicName: string) => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await generateChartTasks({ topic: topicName });
      setChartTasks(tasks);
      setCompletedTasks(new Array(tasks.chart_tasks.length).fill(false));
    } catch (err) {
      setError('Failed to load chart tasks. Please try again.');
      console.error('Error loading chart tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (index: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[index] = !newCompletedTasks[index];
    setCompletedTasks(newCompletedTasks);
  };

  const completedCount = completedTasks.filter(Boolean).length;
  const totalTasks = chartTasks?.chart_tasks.length || 0;

  if (loading) {
    return (
      <div className="chart-view loading">
        <div className="loading-spinner">Loading chart tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-view error">
        <div className="error-message">{error}</div>
        <button onClick={() => topic && loadChartTasks(decodeURIComponent(topic))}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="chart-view">
      <div className="chart-header">
        <h2>Chart Practice: {topic && decodeURIComponent(topic)}</h2>
        <div className="progress-indicator">
          Completed: {completedCount} / {totalTasks} tasks
        </div>
      </div>

      <div className="chart-layout">
        <div className="chart-tasks">
          <h3>Tasks to Complete</h3>
          {chartTasks?.chart_tasks.map((task, index) => (
            <div key={index} className={`task-item ${completedTasks[index] ? 'completed' : ''}`}>
              <div className="task-header">
                <input
                  type="checkbox"
                  checked={completedTasks[index]}
                  onChange={() => toggleTaskCompletion(index)}
                  id={`task-${index}`}
                />
                <label htmlFor={`task-${index}`} className="task-number">
                  Task {index + 1}
                </label>
              </div>
              <p className="task-description">{task}</p>
            </div>
          ))}
          
          {completedCount === totalTasks && totalTasks > 0 && (
            <div className="completion-message">
              🎉 Great job! You've completed all chart tasks for this topic.
            </div>
          )}
        </div>

        <div className="chart-container">
          <div className="tradingview-widget">
            <div className="chart-placeholder">
              <h4>TradingView Chart</h4>
              <p>Interactive chart will be embedded here</p>
              <div className="chart-instructions">
                <h5>How to use:</h5>
                <ul>
                  <li>Use the chart to complete the tasks on the left</li>
                  <li>Switch between different timeframes</li>
                  <li>Add indicators and drawing tools as needed</li>
                  <li>Mark your completed tasks as you finish them</li>
                </ul>
              </div>
              {/* In a real implementation, you would embed the TradingView widget here */}
              <div className="mock-chart">
                <div className="chart-controls">
                  <button>1H</button>
                  <button>4H</button>
                  <button>1D</button>
                  <button>1W</button>
                </div>
                <div className="chart-area">
                  {/* Mock chart visualization */}
                  <svg width="100%" height="300" viewBox="0 0 600 300">
                    <defs>
                      <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4CAF50" />
                        <stop offset="100%" stopColor="#2196F3" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50,250 Q150,200 250,150 T450,100 T550,80"
                      stroke="url(#priceGradient)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle cx="550" cy="80" r="4" fill="#2196F3" />
                    <text x="560" y="85" fontSize="12" fill="#666">Current Price</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-footer">
        <div className="tips">
          <h4>💡 Tips for Chart Analysis</h4>
          <ul>
            <li>Start with higher timeframes to identify the main trend</li>
            <li>Look for support and resistance levels</li>
            <li>Pay attention to volume patterns</li>
            <li>Use multiple indicators for confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChartView;

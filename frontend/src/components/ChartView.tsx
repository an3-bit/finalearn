import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateChartTasks, ChartTasks } from '../api';

const ChartView: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const [chartTasks, setChartTasks] = useState<ChartTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topic) {
      loadChartTasks(decodeURIComponent(topic));
    }
  }, [topic]);

  useEffect(() => {
    // Initialize TradingView widget after chart container is ready
    if (chartContainerRef.current && !loading) {
      initializeTradingViewWidget();
    }
  }, [loading]);

  const initializeTradingViewWidget = () => {
    // Clear any existing widget
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
    }

    // Create TradingView widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    // Create TradingView widget script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "FOREX:EURUSD",
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "withdateranges": true,
      "range": "1D",
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "details": true,
      "hotlist": true,
      "calendar": true,
      "studies": [
        "STD;SMA",
        "STD;EMA", 
        "STD;RSI",
        "STD;MACD"
      ],
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com",
      "container_id": "tradingview_chart",
      "drawings_access": {
        "type": "black",
        "tools": [
          {"name": "Regression Trend"},
          {"name": "Trend Line"},
          {"name": "Horizontal Line"},
          {"name": "Vertical Line"},
          {"name": "Cross Line"},
          {"name": "Trend Angle"},
          {"name": "Rectangle"},
          {"name": "Rotated Rectangle"},
          {"name": "Ellipse"},
          {"name": "Triangle"},
          {"name": "Polyline"},
          {"name": "Path"},
          {"name": "Curve"},
          {"name": "Arc"},
          {"name": "Fibonacci Retracement"},
          {"name": "Fibonacci Extension"},
          {"name": "Fibonacci Fan"},
          {"name": "Fibonacci Arc"},
          {"name": "Fibonacci Channel"},
          {"name": "Fibonacci Time Zone"},
          {"name": "Pitchfork"},
          {"name": "Schiff Pitchfork"},
          {"name": "Modified Schiff Pitchfork"},
          {"name": "Gann Line"},
          {"name": "Gann Fan"},
          {"name": "Gann Square"},
          {"name": "Text"},
          {"name": "Balloon"},
          {"name": "Comment"}
        ]
      },
      "enabled_features": [
        "study_templates",
        "use_localstorage_for_settings",
        "save_chart_properties_to_local_storage",
        "chart_property_page_style",
        "left_toolbar",
        "header_widget",
        "timeframes_toolbar",
        "edit_buttons_in_legend",
        "context_menus",
        "control_bar",
        "border_around_the_chart",
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_resolutions",
        "header_chart_type",
        "header_settings",
        "header_indicators",
        "header_compare",
        "header_undo_redo",
        "header_screenshot",
        "header_fullscreen_button"
      ],
      "disabled_features": [],
      "overrides": {
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.drawWick": true,
        "mainSeriesProperties.candleStyle.drawBorder": true,
        "mainSeriesProperties.candleStyle.borderColor": "#378658",
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
      }
    });

    // Add unique ID for the widget container
    widgetContainer.id = 'tradingview_chart';
    
    if (chartContainerRef.current) {
      chartContainerRef.current.appendChild(widgetContainer);
      widgetContainer.appendChild(script);
      
      // Show loading message
      setTimeout(() => {
        if (chartContainerRef.current && !chartContainerRef.current.querySelector('iframe')) {
          const loadingDiv = chartContainerRef.current.querySelector('.tradingview-widget-loading');
          if (loadingDiv) {
            loadingDiv.innerHTML = `
              <div class="loading-spinner">
                <span>Loading TradingView Chart...</span>
              </div>
            `;
          }
        }
      }, 1000);
    }
  };

  const loadChartTasks = async (topicName: string) => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await generateChartTasks({ topic: topicName });
      setChartTasks(tasks);
      setCompletedTasks(new Array(tasks.chart_tasks.length).fill(false));
    } catch (err) {
      setError('Failed to load chart tasks. Using practice tasks.');
      console.error('Error loading chart tasks:', err);
      // Fallback to default tasks for practice
      const fallbackTasks = {
        chart_tasks: [
          "Identify the current trend direction on the 1-hour EURUSD chart",
          "Draw a horizontal support line at the most recent significant low point",
          "Draw a horizontal resistance line at the most recent significant high point", 
          "Mark any visible chart patterns (triangles, flags, channels)",
          "Set up a simple moving average (20-period) and analyze price relationship",
          "Use the RSI indicator to identify if the market is overbought or oversold"
        ]
      };
      setChartTasks(fallbackTasks);
      setCompletedTasks(new Array(fallbackTasks.chart_tasks.length).fill(false));
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (index: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[index] = !newCompletedTasks[index];
    setCompletedTasks(newCompletedTasks);
    
    // Check if all tasks are completed
    const updatedCompletedCount = newCompletedTasks.filter(Boolean).length;
    if (updatedCompletedCount === totalTasks && totalTasks > 0) {
      // Show completion modal after a short delay
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 500);
    }
  };

  const completedCount = completedTasks.filter(Boolean).length;
  const totalTasks = chartTasks?.chart_tasks.length || 0;

  const handleCompleteChartPractice = () => {
    // Save completion status to localStorage
    const chartCompletion = {
      topic: topic ? decodeURIComponent(topic) : '',
      completedAt: new Date().toISOString(),
      tasksCompleted: completedCount,
      totalTasks: totalTasks
    };
    localStorage.setItem('chartPracticeCompleted', JSON.stringify(chartCompletion));
    
    // Also update lesson progress to mark chart practice as completed
    const lessonContext = localStorage.getItem('currentLesson');
    if (lessonContext) {
      try {
        const lesson = JSON.parse(lessonContext);
        const progressKey = `chart_practice_${lesson.module}_${lesson.week}_${lesson.day}`;
        localStorage.setItem(progressKey, JSON.stringify({
          completed: true,
          completedAt: new Date().toISOString(),
          tasksCompleted: completedCount,
          totalTasks: totalTasks
        }));
      } catch (error) {
        console.error('Error saving chart practice progress:', error);
      }
    }
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'chart-redirect-notification';
    notification.innerHTML = `
      <div>
        <strong>🎉 Chart Practice Complete!</strong><br>
        Ready to continue to Day 2
      </div>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds and navigate
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      navigate('/progress');
    }, 3000);
  };

  const handleContinuePractice = () => {
    setShowCompletionModal(false);
  };

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
          <div className="chart-header-controls">
            <h4>📈 Live TradingView Chart - EURUSD</h4>
            <div className="chart-tools-info">
              <span>📏 Drawing Tools: Use horizontal/trend lines for support & resistance</span>
              <span>📊 Timeframes: Switch between 15M, 1H, 4H, 1D for analysis</span>
              <span>🔧 Indicators: RSI, MACD, Moving Averages available</span>
              <span>🎯 Practice: Draw, analyze, then check off completed tasks</span>
            </div>
          </div>
          
          <div className="tradingview-widget-container" ref={chartContainerRef}>
            <div className="tradingview-widget-loading">
              <div className="loading-spinner">Loading TradingView Chart...</div>
            </div>
          </div>

          <div className="chart-completion-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="completion-stats">
              <span className="completed-count">{completedCount}/{totalTasks} Tasks Complete</span>
              {completedCount === totalTasks && totalTasks > 0 && (
                <button 
                  className="complete-practice-btn"
                  onClick={() => setShowCompletionModal(true)}
                >
                  ✅ Complete Practice
                </button>
              )}
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
            <li>Practice drawing trendlines and identifying chart patterns</li>
          </ul>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="completion-modal">
          <div className="modal-content">
            <div className="completion-header">
              <h2>🎉 Chart Practice Complete!</h2>
              <p>Excellent work! You've completed all the chart analysis tasks.</p>
            </div>
            
            <div className="completion-summary">
              <div className="summary-item">
                <span className="label">Topic:</span>
                <span className="value">{topic && decodeURIComponent(topic)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Tasks Completed:</span>
                <span className="value">{completedCount}/{totalTasks}</span>
              </div>
              <div className="summary-item">
                <span className="label">Next Step:</span>
                <span className="value">Return to progress to start Day 2</span>
              </div>
            </div>

            <div className="completion-message">
              <p>📈 Great job analyzing the charts and completing all the tasks!</p>
              <p>🎯 You can now proceed to the next lesson in your learning path.</p>
            </div>

            <div className="modal-actions">
              <button 
                className="continue-practice-btn"
                onClick={handleContinuePractice}
              >
                Continue Practice
              </button>
              <button 
                className="return-progress-btn"
                onClick={handleCompleteChartPractice}
              >
                Return to Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartView;

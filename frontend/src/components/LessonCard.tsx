import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Day } from '../api';

interface Props {
  day: Day;
  week: number;
  module: string;
  userId: string;
  progress?: {
    lesson_completed: boolean;
    quiz_score?: number;
    time_spent?: number;
    completed_at?: string;
  };
}

const LessonCard: React.FC<Props> = ({ day, week, module, userId, progress }) => {
  const [lessonStatus, setLessonStatus] = useState<'not_started' | 'completed' | 'in_progress'>('not_started');

  useEffect(() => {
    // Check progress to determine lesson status
    if (progress?.lesson_completed) {
      setLessonStatus('completed');
    } else {
      // Check if lesson was started but not completed
      const storedProgress = localStorage.getItem(`lesson_progress_${day.day}`);
      if (storedProgress) {
        setLessonStatus('in_progress');
      }
    }
  }, [progress, day.day]);

  const handleStartLesson = () => {
    // Store minimal lesson context for the player
    const lessonContext = {
      topic: day.topic,
      module,
      week,
      day: day.day
    };
    localStorage.setItem('currentLesson', JSON.stringify(lessonContext));
  };

  const getStatusIcon = () => {
    switch (lessonStatus) {
      case 'completed':
        return progress?.quiz_score && progress.quiz_score >= 70 ? '✅' : '⚠️';
      case 'in_progress':
        return '⏳';
      default:
        return '📚';
    }
  };

  const getStatusText = () => {
    switch (lessonStatus) {
      case 'completed':
        return progress?.quiz_score && progress.quiz_score >= 70 
          ? `Completed (${progress.quiz_score}%)` 
          : `Completed (${progress?.quiz_score || 0}% - Review Needed)`;
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const canAccessCharts = lessonStatus === 'completed';

  return (
    <div className={`lesson-card ${lessonStatus}`}>
      <div className="lesson-header">
        <span className="day-number">Day {day.day}</span>
        <span className="lesson-status" title={getStatusText()}>
          {getStatusIcon()}
        </span>
      </div>
      <h5 className="lesson-topic">{day.topic}</h5>
      
      {progress?.lesson_completed && (
        <div className="progress-info">
          <div className="quiz-score">
            Quiz: {progress.quiz_score || 0}%
          </div>
          {progress.time_spent && (
            <div className="time-spent">
              Time: {Math.round(progress.time_spent / 60)}min
            </div>
          )}
        </div>
      )}

      <div className="lesson-actions">
        {lessonStatus === 'not_started' && (
          <Link 
            to={`/lesson/${encodeURIComponent(day.topic)}`}
            className="start-lesson-btn"
            onClick={handleStartLesson}
          >
            Start Lesson
          </Link>
        )}
        
        {lessonStatus === 'in_progress' && (
          <Link 
            to={`/lesson/${encodeURIComponent(day.topic)}`}
            className="continue-lesson-btn"
            onClick={handleStartLesson}
          >
            Continue Lesson
          </Link>
        )}
        
        {lessonStatus === 'completed' && (
          <>
            <Link 
              to={`/lesson/${encodeURIComponent(day.topic)}`}
              className="review-lesson-btn"
              onClick={handleStartLesson}
            >
              Review Lesson
            </Link>
            <Link 
              to={`/charts/${encodeURIComponent(day.topic)}`}
              className={`chart-btn ${canAccessCharts ? 'enabled' : 'disabled'}`}
            >
              Practice Charts
            </Link>
          </>
        )}
        
        {lessonStatus !== 'completed' && (
          <Link 
            to={`/charts/${encodeURIComponent(day.topic)}`}
            className="chart-btn disabled"
            onClick={(e) => {
              e.preventDefault();
              alert('Complete the lesson first to access chart practice!');
            }}
          >
            Charts (Locked)
          </Link>
        )}
      </div>
    </div>
  );
};

export default LessonCard;

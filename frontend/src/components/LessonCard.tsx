import React from 'react';
import { Link } from 'react-router-dom';
import { Day } from '../api';

interface Props {
  day: Day;
  week: number;
  module: string;
  userId: string;
}

const LessonCard: React.FC<Props> = ({ day, week, module, userId }) => {
  return (
    <div className="lesson-card">
      <div className="lesson-header">
        <span className="day-number">Day {day.day}</span>
        <span className="lesson-status">📚</span>
      </div>
      <h5 className="lesson-topic">{day.topic}</h5>
      <div className="lesson-actions">
        <Link 
          to={`/lesson/${encodeURIComponent(day.topic)}`}
          className="start-lesson-btn"
        >
          Start Lesson
        </Link>
        <Link 
          to={`/charts/${encodeURIComponent(day.topic)}`}
          className="chart-btn"
        >
          View Charts
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateAssessment, Assessment } from '../api';

interface Props {
  userId: string;
}

const AssessmentView: React.FC<Props> = ({ userId }) => {
  const { module } = useParams<{ module: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (module) {
      loadAssessment(decodeURIComponent(module));
    }
  }, [module]);

  const loadAssessment = async (moduleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const assessmentData = await generateAssessment({ module: moduleName });
      setAssessment(assessmentData);
    } catch (err) {
      setError('Failed to load assessment. Please try again.');
      console.error('Error loading assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answer
    });
  };

  const handleSubmit = () => {
    if (!assessment) return;

    const questions = assessment.assessment.questions;
    let correctCount = 0;

    questions.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    // Here you would typically save the assessment results to the database
    console.log('Assessment completed:', {
      userId,
      module: assessment.module,
      score: calculatedScore,
      answers: userAnswers
    });
  };

  const canSubmit = assessment ? 
    Object.keys(userAnswers).length === assessment.assessment.questions.length : 
    false;

  if (loading) {
    return (
      <div className="assessment-view loading">
        <div className="loading-spinner">Loading assessment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-view error">
        <div className="error-message">{error}</div>
        <button onClick={() => module && loadAssessment(decodeURIComponent(module))}>
          Retry
        </button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="assessment-view error">
        <div className="error-message">No assessment available</div>
      </div>
    );
  }

  if (submitted && score !== null) {
    return (
      <div className="assessment-view completed">
        <div className="results-header">
          <h2>Assessment Results</h2>
          <div className={`score-display ${score >= 70 ? 'pass' : 'fail'}`}>
            <div className="score-circle">
              <span className="score-number">{score}%</span>
            </div>
            <p className="score-status">
              {score >= 70 ? '🎉 Well Done!' : '📚 Keep Learning!'}
            </p>
          </div>
        </div>

        <div className="results-breakdown">
          <h3>Question Review</h3>
          {assessment.assessment.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            
            return (
              <div key={index} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>Question {index + 1}</h4>
                <p className="question-text">{question.q}</p>
                <div className="answer-comparison">
                  <div className="user-answer">
                    <strong>Your answer:</strong> {userAnswer}
                    <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="correct-answer">
                      <strong>Correct answer:</strong> {question.answer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          {score >= 70 ? (
            <div className="success-message">
              <p>Congratulations! You've successfully completed the {assessment.module} module.</p>
              <p>You can now proceed to more advanced topics or practice with demo trading.</p>
            </div>
          ) : (
            <div className="retry-message">
              <p>Don't worry! Learning takes time. Review the lesson materials and try again.</p>
              <p>Focus on the questions you missed and practice with the chart exercises.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-view">
      <div className="assessment-header">
        <h2>{assessment.module} Assessment</h2>
        <p>Answer all questions to complete the module assessment</p>
        <div className="progress-indicator">
          Answered: {Object.keys(userAnswers).length} / {assessment.assessment.questions.length}
        </div>
      </div>

      <div className="assessment-questions">
        {assessment.assessment.questions.map((question, index) => (
          <div key={index} className="question-card">
            <h3>Question {index + 1}</h3>
            <p className="question-text">{question.q}</p>
            <div className="answer-choices">
              {question.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex} className="choice-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={choice}
                    checked={userAnswers[index] === choice}
                    onChange={() => handleAnswerSelect(index, choice)}
                  />
                  <span className="choice-text">{choice}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="assessment-footer">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="submit-btn"
        >
          Submit Assessment
        </button>
        <p className="submit-note">
          {canSubmit 
            ? 'Ready to submit your assessment' 
            : 'Please answer all questions before submitting'
          }
        </p>
      </div>
    </div>
  );
};

export default AssessmentView;

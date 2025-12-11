import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateLesson, LessonContent, LessonStep, updateUserProgress } from '../api';

interface Props {
  userId: string;
}

const LessonPlayer: React.FC<Props> = ({ userId }) => {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [stepIndex: number]: string[] }>({});
  const [lessonStartTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [originalLessonData, setOriginalLessonData] = useState<any>(null);

  useEffect(() => {
    if (topic) {
      // First check if we have lesson data from the learning plan
      const storedLessonData = localStorage.getItem('currentLesson');
      if (storedLessonData) {
        try {
          const lessonData = JSON.parse(storedLessonData);
          console.log('LessonPlayer - Using stored lesson data:', lessonData);
          setOriginalLessonData(lessonData);
          loadLessonFromPlan(lessonData);
          // Clear the stored data after using it
          localStorage.removeItem('currentLesson');
        } catch (error) {
          console.error('Error parsing stored lesson data:', error);
          loadLesson(decodeURIComponent(topic));
        }
      } else {
        loadLesson(decodeURIComponent(topic));
      }
    }
  }, [topic]);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNextStep();
            return 5 * 60; // Reset timer for next step
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStepIndex, isPaused, timeLeft]);

  const loadLessonFromPlan = (lessonData: any) => {
    setLoading(true);
    setError(null);
    try {
      // Convert the lesson plan data to the LessonContent format expected by the player
      const steps: LessonStep[] = [
        {
          step: 1,
          type: 'concept',
          content: lessonData.content || 'Welcome to this lesson!'
        }
      ];

      // Add activities as application steps
      if (lessonData.activities && lessonData.activities.length > 0) {
        lessonData.activities.forEach((activity: string, index: number) => {
          steps.push({
            step: steps.length + 1,
            type: 'application',
            content: activity
          });
        });
      }

      // Add quiz questions as quiz steps
      if (lessonData.quiz_questions && lessonData.quiz_questions.length > 0) {
        steps.push({
          step: steps.length + 1,
          type: 'quiz',
          content: 'Test your understanding of this lesson',
          questions: lessonData.quiz_questions.map((q: any) => q.question)
        });
      }

      const lessonContent: LessonContent = {
        topic: lessonData.topic,
        steps: steps
      };
      
      console.log('LessonPlayer - Converted lesson content:', lessonContent);
      setLesson(lessonContent);
      setCurrentStepIndex(0);
      setTimeLeft(5 * 60);
    } catch (err) {
      setError('Failed to load lesson content from learning plan. Please try again.');
      console.error('Error loading lesson from plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (topicName: string) => {
    setLoading(true);
    setError(null);
    try {
      const lessonData = await generateLesson({ topic: topicName });
      setLesson(lessonData);
      setCurrentStepIndex(0);
      setTimeLeft(5 * 60);
    } catch (err) {
      setError('Failed to load lesson content. Please try again.');
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setTimeLeft(5 * 60);
    } else {
      // Lesson completed
      handleLessonComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimeLeft(5 * 60);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    const stepAnswers = quizAnswers[currentStepIndex] || [];
    stepAnswers[questionIndex] = answer;
    setQuizAnswers({
      ...quizAnswers,
      [currentStepIndex]: stepAnswers
    });
  };

  const calculateQuizScore = (): number => {
    // Simple scoring - in a real app, you'd have correct answers to compare against
    const quizSteps = lesson?.steps.filter(step => step.type === 'quiz') || [];
    if (quizSteps.length === 0) return 100;
    
    const totalQuestions = quizSteps.reduce((sum, step) => sum + (step.questions?.length || 0), 0);
    const answeredQuestions = Object.values(quizAnswers).flat().filter(answer => answer.trim()).length;
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const handleLessonComplete = async () => {
    const timeSpent = Math.round((Date.now() - lessonStartTime) / 1000);
    const quizScore = calculateQuizScore();

    try {
      // Use original lesson data if available, otherwise use defaults
      const progressData = {
        user_id: userId,
        module: originalLessonData?.module || 'Current Module',
        week: originalLessonData?.week || 1,
        day: originalLessonData?.day || 1,
        lesson_completed: true,
        quiz_score: quizScore,
        time_spent: timeSpent
      };

      console.log('LessonPlayer - Updating progress with:', progressData);
      
      await updateUserProgress(progressData);

      // Show completion message and navigate back to progress page
      alert(`Lesson completed! 🎉\n\nQuiz Score: ${quizScore}%\nTime Spent: ${Math.round(timeSpent / 60)} minutes`);
      
      // Navigate back to progress page to see updated plan
      navigate('/progress');
      
    } catch (err) {
      console.error('Error updating progress:', err);
      // Still navigate back even if progress update fails
      navigate('/progress');
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="lesson-player loading">
        <div className="loading-spinner">Loading lesson...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-player error">
        <div className="error-message">{error}</div>
        <button onClick={() => topic && loadLesson(decodeURIComponent(topic))}>
          Retry
        </button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-player error">
        <div className="error-message">No lesson content available</div>
      </div>
    );
  }

  const currentStep = lesson.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / lesson.steps.length) * 100;

  return (
    <div className="lesson-player">
      <div className="lesson-header">
        <h2>{lesson.topic}</h2>
        <div className="lesson-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="step-counter">
            Step {currentStepIndex + 1} of {lesson.steps.length}
          </span>
        </div>
      </div>

      <div className="lesson-timer">
        <div className="timer-display">
          <span className="time-left">{formatTime(timeLeft)}</span>
          <button onClick={togglePause} className="pause-btn">
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
        <div className="step-type-badge">
          {currentStep.type}
        </div>
      </div>

      <div className="lesson-content">
        {currentStep.type === 'quiz' ? (
          <QuizStep 
            step={currentStep}
            stepIndex={currentStepIndex}
            answers={quizAnswers[currentStepIndex] || []}
            onAnswer={handleQuizAnswer}
          />
        ) : (
          <ContentStep step={currentStep} />
        )}
      </div>

      <div className="lesson-controls">
        <button 
          onClick={handlePrevStep} 
          disabled={currentStepIndex === 0}
          className="nav-btn prev-btn"
        >
          ← Previous
        </button>
        
        <button 
          onClick={handleNextStep}
          className="nav-btn next-btn"
        >
          {currentStepIndex === lesson.steps.length - 1 ? 'Complete Lesson' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

interface ContentStepProps {
  step: LessonStep;
}

const ContentStep: React.FC<ContentStepProps> = ({ step }) => {
  return (
    <div className="content-step">
      <h3>{step.type === 'concept' ? 'Concept' : 
           step.type === 'example' ? 'Example' : 
           step.type === 'application' ? 'Application' : 'Content'}</h3>
      <div className="step-content">
        {step.content}
      </div>
    </div>
  );
};

interface QuizStepProps {
  step: LessonStep;
  stepIndex: number;
  answers: string[];
  onAnswer: (questionIndex: number, answer: string) => void;
}

const QuizStep: React.FC<QuizStepProps> = ({ step, stepIndex, answers, onAnswer }) => {
  return (
    <div className="quiz-step">
      <h3>Quiz Time! 📝</h3>
      <div className="quiz-questions">
        {step.questions?.map((question, index) => (
          <div key={index} className="quiz-question">
            <h4>Question {index + 1}</h4>
            <p>{question}</p>
            <textarea
              value={answers[index] || ''}
              onChange={(e) => onAnswer(index, e.target.value)}
              placeholder="Enter your answer here..."
              className="quiz-answer-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonPlayer;

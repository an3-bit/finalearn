import React, { useState, useEffect } from 'react';
import { generatePlan, LessonPlan } from '../api';
import LessonCard from './LessonCard';
import { TrendingUp, BookOpen, Target, Brain, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  userId: string;
}

const Dashboard: React.FC<Props> = ({ userId }) => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState('Metal Trading');
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedModuleForPlan, setSelectedModuleForPlan] = useState<any>(null);

  const modules = [
    {
      name: 'Metal Trading',
      icon: <TrendingUp className="module-icon" />,
      description: 'Learn to trade precious metals like Gold, Silver, and Platinum',
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Beginner',
      duration: '4 weeks',
      color: '#FFD700'
    },
    {
      name: 'Currency Pairs',
      icon: <BookOpen className="module-icon" />,
      description: 'Master major and minor currency pairs trading',
      image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Beginner',
      duration: '3 weeks',
      color: '#4CAF50'
    },
    {
      name: 'Technical Analysis',
      icon: <Target className="module-icon" />,
      description: 'Read charts and identify trading opportunities',
      image: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Intermediate',
      duration: '6 weeks',
      color: '#2196F3'
    },
    {
      name: 'Fundamental Analysis',
      icon: <Brain className="module-icon" />,
      description: 'Understand economic factors affecting markets',
      image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Intermediate',
      duration: '5 weeks',
      color: '#9C27B0'
    },
    {
      name: 'Risk Management',
      icon: <Shield className="module-icon" />,
      description: 'Protect your capital with proper risk strategies',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Advanced',
      duration: '4 weeks',
      color: '#FF5722'
    },
    {
      name: 'Trading Psychology',
      icon: <Heart className="module-icon" />,
      description: 'Master your emotions and trading mindset',
      image: 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Advanced',
      duration: '3 weeks',
      color: '#E91E63'
    }
  ];

  const handleModuleClick = (module: any) => {
    console.log('Dashboard - Module clicked:', module);
    setSelectedModule(module.name);
    setSelectedModuleForPlan(module);
    setShowModal(true);
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await generatePlan({
        module: selectedModuleForPlan?.name || selectedModule,
        duration: '30d'
      });
      
      console.log('Generated plan:', newPlan);
      console.log('Selected module data:', selectedModuleForPlan);
      
      // Create a clean version of module data without React elements
      const cleanModuleData = {
        name: selectedModuleForPlan.name,
        description: selectedModuleForPlan.description,
        level: selectedModuleForPlan.difficulty,
        duration: selectedModuleForPlan.duration,
        color: selectedModuleForPlan.color,
        image: selectedModuleForPlan.image
      };
      
      console.log('Clean module data:', cleanModuleData);
      
      // Store the plan in localStorage to pass to progress page
      localStorage.setItem('generatedPlan', JSON.stringify(newPlan));
      localStorage.setItem('selectedModuleData', JSON.stringify(cleanModuleData));
      
      setShowModal(false);
      
      // Navigate to progress page with a small delay to ensure localStorage is set
      setTimeout(() => {
        console.log('Dashboard - Attempting to navigate to /progress');
        console.log('Dashboard - Current URL:', window.location.href);
        try {
          navigate('/progress');
          console.log('Dashboard - Navigate function called successfully');
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback: use window.location
          console.log('Dashboard - Using window.location fallback');
          window.location.href = '/progress';
        }
      }, 500);
      
    } catch (err) {
      setError('Failed to generate lesson plan. Please try again.');
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <img 
            src="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Trading Background"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>Master Forex Trading with AI-Powered Learning</h1>
          <p>Join thousands of successful traders who started their journey with FinaLearn. Learn from beginner to expert with our personalized, interactive courses designed specifically for African markets.</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Learners</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">6</span>
              <span className="stat-label">Expert Modules</span>
            </div>
          </div>
          <div className="hero-cta">
            <button className="cta-primary">Start Learning Now</button>
            <button className="cta-secondary">Watch Demo</button>
          </div>
        </div>
      </div>

      {/* Learning Path Section */}
      <div className="learning-path-section">
        <div className="section-header">
          <h2>Choose Your Learning Path</h2>
          <p>Select from our carefully crafted modules designed to take you from beginner to professional trader</p>
        </div>
        <div className="modules-container">
          {modules.map((module, index) => (
            <div 
              key={module.name}
              className={`module-card ${selectedModule === module.name ? 'selected' : ''}`}
              onClick={() => handleModuleClick(module)}
              style={{ '--module-color': module.color } as React.CSSProperties}
            >
              <div className="module-image">
                <img src={module.image} alt={module.name} />
                <div className="module-overlay">
                  {module.icon}
                </div>
              </div>
              <div className="module-content">
                <h4>{module.name}</h4>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span className={`difficulty ${module.difficulty.toLowerCase()}`}>
                    {module.difficulty}
                  </span>
                  <span className="duration">{module.duration}</span>
                </div>
                <button className="module-cta">Start This Path</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Our AI-powered system creates personalized learning experiences tailored to your goals</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-icon">
              <Target />
            </div>
            <h4>1. Choose Your Path</h4>
            <p>Select from 6 specialized modules covering everything from basic currency pairs to advanced trading psychology.</p>
          </div>
          <div className="step-item">
            <div className="step-icon">
              <Brain />
            </div>
            <h4>2. AI Creates Your Plan</h4>
            <p>Our intelligent system generates a personalized 30-day learning plan based on your selected module and experience level.</p>
          </div>
          <div className="step-item">
            <div className="step-icon">
              <BookOpen />
            </div>
            <h4>3. Interactive Learning</h4>
            <p>Engage with interactive lessons, real-time chart analysis, and practical exercises designed for African markets.</p>
          </div>
          <div className="step-item">
            <div className="step-icon">
              <TrendingUp />
            </div>
            <h4>4. Track Progress</h4>
            <p>Monitor your learning journey with detailed analytics, quizzes, and milestone achievements.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="welcome-message">
        <h3>Get Started</h3>
        <p>Select a module above and click "Start This Path" to generate your personalized learning plan and begin your Forex education journey.</p>
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

      {/* Modal for Lesson Plan Generation */}
      {showModal && selectedModuleForPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start Your {selectedModuleForPlan.name} Journey</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="module-preview">
                <img src={selectedModuleForPlan.image} alt={selectedModuleForPlan.name} />
                <div className="module-details">
                  <h4>{selectedModuleForPlan.name}</h4>
                  <p>{selectedModuleForPlan.description}</p>
                  <div className="module-info">
                    <span className="info-item">
                      <strong>Duration:</strong> {selectedModuleForPlan.duration}
                    </span>
                    <span className="info-item">
                      <strong>Level:</strong> {selectedModuleForPlan.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="plan-benefits">
                <h5>What you'll get:</h5>
                <ul>
                  <li>✅ Personalized 30-day learning plan</li>
                  <li>✅ Daily 30-minute structured lessons</li>
                  <li>✅ Interactive chart analysis</li>
                  <li>✅ Real-time progress tracking</li>
                  <li>✅ Quizzes and assessments</li>
                  <li>✅ African market focused content</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleGeneratePlan}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Generating Plan...
                  </>
                ) : (
                  'Start This Path'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Empowering African traders with AI-driven education for sustainable financial success.</p>
      </footer>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, User, Trophy, BookOpen, TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { path: '/progress', label: 'Progress', icon: <Trophy size={18} /> }
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/dashboard" className="logo">
          <div className="logo-icon">
            <TrendingUp size={28} />
          </div>
          <div className="logo-text">
            <h1>FinaLearn</h1>
            <p>AI-Powered Forex Education</p>
          </div>
        </Link>
        
        <nav className="nav">
          {navigation.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="user-profile">
            <User size={18} />
            <span>Profile</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

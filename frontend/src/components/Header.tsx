import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/dashboard" className="logo">
          <h1>FinaLearn</h1>
          <p>AI-Powered Forex Education</p>
        </Link>
        <nav className="nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/progress" className="nav-link">Progress</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

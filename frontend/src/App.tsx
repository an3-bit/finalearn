import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LessonPlayer from './components/LessonPlayer';
import ChartView from './components/ChartView';
import AssessmentView from './components/AssessmentView';
import ProgressView from './components/ProgressView';
import Header from './components/Header';
import './App.css';

const App: React.FC = () => {
  const [currentUser] = useState('1'); // Mock user ID for now

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard userId={currentUser} />} />
            <Route path="/lesson/:topic" element={<LessonPlayer userId={currentUser} />} />
            <Route path="/charts/:topic" element={<ChartView />} />
            <Route path="/assessment/:module" element={<AssessmentView userId={currentUser} />} />
            <Route path="/progress" element={<ProgressView userId={currentUser} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

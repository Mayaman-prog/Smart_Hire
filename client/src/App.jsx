import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import TestCardsPage from './pages/TestCardsPage/TestCardsPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          <>
            <h1>Smart Hire - Job Portal</h1>
            <p>Frontend setup complete!</p>
          </>
        } />
        <Route path="/test-cards" element={<TestCardsPage />} />
      </Routes>
    </div>
  );
}

export default App;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/common/Navbar/Navbar';
import TestCardsPage from './pages/TestCardsPage/TestCardsPage';
import TagTestPage from './pages/TagTestPage/TagTestPage';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={
                        <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <h1>Smart Hire - Job Portal</h1>
                            <p>Frontend setup complete!</p>
                        </div>
                    } />
                    <Route path="/test-cards" element={<TestCardsPage />} />
                    <Route path="/test-tags" element={<TagTestPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
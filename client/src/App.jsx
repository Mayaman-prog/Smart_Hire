import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import JobListing from './components/jobs/JobListing';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    axios.get(`${API_URL}/test`)
      .then(res => setMessage(res.data.message))
      .catch(err => {
        console.error('Error:', err);
        setMessage('Error connecting to backend');
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-grow">
      <Routes>
        {/* Remove comments when checking if the frontend and backend are working together or not */}
        {/* <Route path="/" element={
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <h1>SmartHire Portal</h1>
            <p>Backend Status: {message}</p>
          </div>
        } /> */}

        {/* Commented this route because we are using the JobListing component */}
        {/* <Route path="/jobs" element={<div style={{ textAlign: 'center', marginTop: '80px' }}>Jobs Page</div>} /> */}
        <Route path="/companies" element={<div style={{ textAlign: 'center', marginTop: '80px' }}>Companies Page</div>} />
        <Route path="/dashboard" element={<div style={{ textAlign: 'center', marginTop: '80px' }}>Dashboard</div>} />
        <Route path="/login" element={<div style={{ textAlign: 'center', marginTop: '80px' }}>Login Page</div>} />
        <Route path="/register" element={<div style={{ textAlign: 'center', marginTop: '80px' }}>Register Page</div>} />
        <Route path="/jobs" element={<JobListing />} />
      </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
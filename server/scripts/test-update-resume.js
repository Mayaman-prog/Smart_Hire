const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzbWFydGhpcmUuY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6bnVsbCwiaWF0IjoxNzc3NjE4NTg2LCJleHAiOjE3Nzc3MDQ5ODZ9.Moglm6kP4gLf6rWYMe3jjpJuBZvoKq9B0PbQklyZcnw';
const resumeId = 16;

async function updateResume() {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/users/resume/${resumeId}`,
      { title: 'My Updated Resume' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

updateResume();
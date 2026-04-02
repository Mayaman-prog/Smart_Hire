import React, { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    axios.get('/api/test')
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage('Error connecting to backend'))
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>SmartHire Portal</h1>
      <p>Backend Status: {message}</p>
    </div>
  )
}

export default App
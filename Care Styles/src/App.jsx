import { useState, useEffect } from 'react'
import './App.css'
import RegistrationPage from './components/RegistrationPage'
import SegmentForm from './components/SegmentForm'
import SegmentResult from './components/SegmentResult'
import { calculateSegment } from './utils/segmentAlgorithm'

function App() {
  const [userInfo, setUserInfo] = useState(null)
  const [segmentResult, setSegmentResult] = useState(null)
  const [scores, setScores] = useState(null)
  const [fullSegmentResult, setFullSegmentResult] = useState(null)

  const handleRegister = (userData) => {
    setUserInfo(userData)
    // Store user info in localStorage for persistence
    localStorage.setItem('careStylesUser', JSON.stringify(userData))
  }

  const handleSubmit = (responses) => {
    const result = calculateSegment(responses)
    setSegmentResult(result.segment)
    setScores(result.scores)
    setFullSegmentResult(result)
  }

  const handleReset = () => {
    setSegmentResult(null)
    setScores(null)
    setFullSegmentResult(null)
  }

  const handleLogout = () => {
    setUserInfo(null)
    setSegmentResult(null)
    setScores(null)
    setFullSegmentResult(null)
    localStorage.removeItem('careStylesUser')
  }

  // Check for stored user info on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('careStylesUser')
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing stored user info:', e)
      }
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>CareStyles™</h1>
        <p className="subtitle">Patient Segment Identification</p>
        {userInfo && (
          <div className="user-info">
            <span>Welcome, {userInfo.firstName} {userInfo.lastName}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </header>

      {!userInfo ? (
        <RegistrationPage onRegister={handleRegister} />
      ) : !segmentResult ? (
        <SegmentForm onSubmit={handleSubmit} />
      ) : (
        <SegmentResult 
          segment={segmentResult} 
          scores={scores}
          onReset={handleReset}
          userInfo={userInfo}
          segmentResult={fullSegmentResult}
        />
      )}
    </div>
  )
}

export default App

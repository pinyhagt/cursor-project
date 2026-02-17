import { useState, useEffect } from 'react'
import './SegmentResult.css'
import { sendResultsEmail } from '../utils/emailService'

const SEGMENT_INFO = {
  1: {
    name: 'Proactive Skeptic',
    description: 'This segment represents patients who are proactive about their health but may be skeptical of medical information.',
    color: '#667eea'
  },
  2: {
    name: 'Disengaged Health Risker',
    description: 'This segment represents patients who are disengaged from their health management and may be at higher risk.',
    color: '#f093fb'
  },
  3: {
    name: 'Uncertain Reliant',
    description: 'This segment represents patients who are uncertain about health issues and rely heavily on their doctor.',
    color: '#4facfe'
  },
  4: {
    name: 'Proactive Reliant',
    description: 'This segment represents patients who are both proactive and work collaboratively with their doctor.',
    color: '#43e97b'
  }
}

function SegmentResult({ segment, scores, onReset, userInfo, segmentResult }) {
  const info = SEGMENT_INFO[segment]
  const maxScore = Math.max(...Object.values(scores))
  const minScore = Math.min(...Object.values(scores))
  const [emailStatus, setEmailStatus] = useState(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Auto-send email when component mounts
  useEffect(() => {
    if (userInfo && segmentResult) {
      handleSendEmail()
    }
  }, [])

  const handleSendEmail = async () => {
    if (!userInfo || !segmentResult) return

    setIsSendingEmail(true)
    setEmailStatus(null)

    const result = await sendResultsEmail(userInfo, segmentResult)
    
    setIsSendingEmail(false)
    setEmailStatus(result)
  }

  return (
    <div className="segment-result">
      <div className="result-header">
        <h2>Patient Segment Identified</h2>
        <p className="accuracy-note">Model accuracy: 85.3%</p>
      </div>

      <div className="result-card" style={{ borderColor: info.color }}>
        <div className="segment-badge" style={{ background: info.color }}>
          Segment {segment}
        </div>
        <h3 className="segment-name">{info.name}</h3>
        <p className="segment-description">{info.description}</p>
      </div>

      <div className="scores-section">
        <h4>Segment Scores</h4>
        <p className="scores-explanation">
          The algorithm calculates a score for each segment. The segment with the highest score is your predicted segment.
        </p>
        <div className="scores-grid">
          {Object.entries(scores).map(([segNum, score]) => {
            const segInfo = SEGMENT_INFO[segNum]
            const isMax = score === maxScore
            const percentage = ((score - minScore) / (maxScore - minScore)) * 100
            
            return (
              <div 
                key={segNum} 
                className={`score-item ${isMax ? 'highlighted' : ''}`}
                style={isMax ? { borderColor: segInfo.color } : {}}
              >
                <div className="score-header">
                  <span className="score-segment">Segment {segNum}</span>
                  <span className="score-value">{score.toFixed(2)}</span>
                </div>
                <div className="score-bar-container">
                  <div 
                    className="score-bar" 
                    style={{ 
                      width: `${Math.max(percentage, 5)}%`,
                      background: segInfo.color
                    }}
                  />
                </div>
                <div className="score-label">{segInfo.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="email-section">
        <div className="email-status">
          {isSendingEmail && (
            <div className="email-loading">
              <span className="spinner"></span>
              <span>Sending results to your email...</span>
            </div>
          )}
          {emailStatus && emailStatus.success && (
            <div className="email-success">
              <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Results sent successfully to {userInfo?.email}</span>
            </div>
          )}
          {emailStatus && !emailStatus.success && (
            <div className="email-error">
              <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <span>Failed to send email: {emailStatus.error}</span>
                <button onClick={handleSendEmail} className="retry-button">
                  Try Again
                </button>
              </div>
            </div>
          )}
          {!isSendingEmail && !emailStatus && (
            <button onClick={handleSendEmail} className="send-email-button">
              Send Results to Email
            </button>
          )}
        </div>
      </div>

      <div className="result-actions">
        <button onClick={onReset} className="reset-button">
          Start Over
        </button>
      </div>
    </div>
  )
}

export default SegmentResult

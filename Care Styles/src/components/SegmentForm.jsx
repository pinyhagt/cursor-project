import { useState } from 'react'
import './SegmentForm.css'

const QUESTIONS = [
  {
    id: 'Q1C',
    text: 'I leave it to my doctor to make the right decisions about my health'
  },
  {
    id: 'Q1D',
    text: 'I rely on my doctor to tell me everything I need to know to manage my health'
  },
  {
    id: 'Q1E',
    text: 'I work together with my doctor to manage my health'
  },
  {
    id: 'Q1G',
    text: 'Most health issues are too complicated for me to understand'
  },
  {
    id: 'Q1H',
    text: 'I have difficulty understanding health information that I read'
  },
  {
    id: 'Q1I',
    text: 'It is important for me to be informed about health issues'
  }
]

function SegmentForm({ onSubmit }) {
  const [responses, setResponses] = useState({
    Q1C: '',
    Q1D: '',
    Q1E: '',
    Q1G: '',
    Q1H: '',
    Q1I: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value === '' ? '' : parseInt(value)
    }))
    // Clear error for this question when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    QUESTIONS.forEach(q => {
      if (!responses[q.id] || responses[q.id] < 1 || responses[q.id] > 7) {
        newErrors[q.id] = 'Please select a value between 1 and 7'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(responses)
    }
  }

  return (
    <form className="segment-form" onSubmit={handleSubmit}>
      <div className="form-intro">
        <p>
          On a scale from <strong>1 - 7</strong>, please indicate how strongly you agree or disagree with each of the following statements.
        </p>
        <div className="scale-labels">
          <span>1 = Very strongly disagree</span>
          <span>7 = Very strongly agree</span>
        </div>
      </div>

      <div className="questions-container">
        {QUESTIONS.map((question, index) => (
          <div key={question.id} className="question-item">
            <label className="question-label">
              <span className="question-number">{index + 1}.</span>
              <span className="question-text">{question.text}</span>
            </label>
            <div className="radio-group">
              {[1, 2, 3, 4, 5, 6, 7].map(value => (
                <label key={value} className="radio-option">
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={responses[question.id] === value}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                  />
                  <span className="radio-label">{value}</span>
                </label>
              ))}
            </div>
            {errors[question.id] && (
              <span className="error-message">{errors[question.id]}</span>
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          Identify Patient Segment
        </button>
      </div>
    </form>
  )
}

export default SegmentForm

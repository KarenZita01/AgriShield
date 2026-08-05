import { useState } from 'react'

export default function FeedbackView() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [rating, setRating] = useState(0)
  const [easeOfUse, setEaseOfUse] = useState('')
  const [reliability, setReliability] = useState('')
  const [improvements, setImprovements] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store feedback locally
    const feedback = {
      name, email, walletAddress, rating, easeOfUse, reliability, improvements,
      timestamp: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('agrishield_feedback') || '[]')
    existing.push(feedback)
    localStorage.setItem('agrishield_feedback', JSON.stringify(existing))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✅</div>
        <h3 className="mb-2">Thank You!</h3>
        <p className="text-sm text-muted">
          Your feedback has been recorded. It helps us improve AgriShield for farmers.
        </p>
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline mt-4"
          style={{ textDecoration: 'none' }}
        >
          Also fill our Google Form
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">User Feedback</span>
        </div>
        <p className="text-sm text-muted mb-2">
          Help us improve AgriShield. Your feedback matters!
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="input-group">
            <label>Name *</label>
            <input className="input" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Email *</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Wallet Address</label>
            <input className="input" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} placeholder="G..." />
          </div>
        </div>

        <div className="card">
          <div className="input-group">
            <label>Product Rating *</label>
            <div className="flex gap-2 mt-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`btn btn-sm ${rating >= n ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setRating(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="input-group">
            <label>How easy was it to use? *</label>
            <select className="input" required value={easeOfUse} onChange={e => setEaseOfUse(e.target.value)}>
              <option value="">Select...</option>
              <option value="very_easy">Very Easy</option>
              <option value="easy">Easy</option>
              <option value="neutral">Neutral</option>
              <option value="difficult">Difficult</option>
              <option value="very_difficult">Very Difficult</option>
            </select>
          </div>
          <div className="input-group">
            <label>How reliable do you find the service? *</label>
            <select className="input" required value={reliability} onChange={e => setReliability(e.target.value)}>
              <option value="">Select...</option>
              <option value="very_reliable">Very Reliable</option>
              <option value="reliable">Reliable</option>
              <option value="neutral">Neutral</option>
              <option value="unreliable">Unreliable</option>
              <option value="very_unreliable">Very Unreliable</option>
            </select>
          </div>
          <div className="input-group">
            <label>What improvements would you suggest?</label>
            <textarea
              className="input"
              rows={3}
              value={improvements}
              onChange={e => setImprovements(e.target.value)}
              placeholder="Your suggestions..."
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ margin: '0 0 16px 0' }}>
          Submit Feedback
        </button>
      </form>
    </div>
  )
}

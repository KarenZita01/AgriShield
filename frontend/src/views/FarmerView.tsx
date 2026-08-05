import { useState } from 'react'

interface FarmerProps {
  pool: any
  wallet: any
}

export default function FarmerView({ pool, wallet }: FarmerProps) {
  const [enrolling, setEnrolling] = useState(false)

  if (!wallet.connected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌱</div>
        <h3 className="mb-2">Farmer Dashboard</h3>
        <p className="text-sm text-muted">
          Connect your wallet to enroll and manage your coverage.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Coverage</span>
        </div>
        <div className="stat-grid">
          <div>
            <div className="stat-label">Status</div>
            <div className="stat-value text-sm">Not Enrolled</div>
          </div>
          <div>
            <div className="stat-label">Premium</div>
            <div className="stat-value text-sm">1.00 mUSD</div>
          </div>
          <div>
            <div className="stat-label">Coverage</div>
            <div className="stat-value text-sm">50.00 mUSD</div>
          </div>
          <div>
            <div className="stat-label">Claim</div>
            <div className="stat-value text-sm">—</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Enroll</span>
        </div>
        <p className="text-sm text-muted mb-2">
          Pay a 1 mUSD premium to receive 50 mUSD coverage when rainfall drops below the threshold.
        </p>
        <button
          className="btn btn-primary"
          disabled={enrolling}
          onClick={() => setEnrolling(true)}
        >
          {enrolling ? 'Enrolling...' : 'Enroll Now (1 mUSD)'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Weather Data</span>
        </div>
        <div className="stat-grid">
          <div>
            <div className="stat-label">Current Rainfall</div>
            <div className="stat-value text-sm">— mm</div>
          </div>
          <div>
            <div className="stat-label">Threshold</div>
            <div className="stat-value text-sm">≤50mm</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Claim Payout</span>
        </div>
        <p className="text-sm text-muted mb-2">
          If the pool is triggered by a weather breach, claim your payout here.
        </p>
        <button className="btn btn-outline" disabled>
          Claim Payout (Pool not triggered)
        </button>
      </div>
    </div>
  )
}

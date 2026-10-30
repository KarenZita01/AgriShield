import { useState } from 'react'
import { useToasts } from '../hooks/useToasts'

interface FarmerProps {
  pool: any
  wallet: any
}

export default function FarmerView({ pool, wallet }: FarmerProps) {
  const { addToast } = useToasts()
  const [enrolling, setEnrolling] = useState(false)

  const handleEnroll = () => {
    if (!wallet.connected) {
      addToast('Connect your wallet to enroll', 'error')
      return
    }
    setEnrolling(true)
    addToast('Enrollment transaction queued', 'info')
  }

  const handleClaim = () => {
    if (!wallet.connected) {
      addToast('Connect your wallet to claim', 'error')
      return
    }
    if (pool.state !== 1) {
      addToast('Pool is not triggered yet', 'error')
      return
    }
    addToast('Payout claim queued', 'info')
  }

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
            <div className="stat-value text-sm">
              {pool.premium !== undefined ? ((pool.premium as number) / 10_000_000).toFixed(2) : '1.00'} mUSD
            </div>
          </div>
          <div>
            <div className="stat-label">Coverage</div>
            <div className="stat-value text-sm">
              {pool.coverage !== undefined ? ((pool.coverage as number) / 10_000_000).toFixed(2) : '50.00'} mUSD
            </div>
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
          onClick={handleEnroll}
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
        <button className="btn btn-outline" onClick={handleClaim}>
          Claim Payout ({pool.state === 1 ? 'Triggered' : 'Pool not triggered'})
        </button>
      </div>
    </div>
  )
}

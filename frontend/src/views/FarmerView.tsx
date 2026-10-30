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
            <div className="stat-label" aria-label="Coverage status">Status</div>
            <div className="stat-value text-sm" aria-label="Not enrolled" aria-live="polite">Not Enrolled</div>
          </div>
          <div>
            <div className="stat-label" aria-label="Premium amount">Premium</div>
            <div className="stat-value text-sm" aria-label="Premium">
              {pool.premium !== undefined ? ((pool.premium as number) / 10_000_000).toFixed(2) : '1.00'} mUSD
            </div>
          </div>
          <div>
            <div className="stat-label" aria-label="Coverage amount">Coverage</div>
            <div className="stat-value text-sm" aria-label="Coverage">
              {pool.coverage !== undefined ? ((pool.coverage as number) / 10_000_000).toFixed(2) : '50.00'} mUSD
            </div>
          </div>
          <div>
            <div className="stat-label" aria-label="Claim status">Claim</div>
            <div className="stat-value text-sm" aria-label="Claim status">—</div>
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
          aria-label="Enroll as farmer"
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
            <div className="stat-label" aria-label="Current rainfall">Current Rainfall</div>
            <div className="stat-value text-sm" aria-label="Current rainfall">— mm</div>
          </div>
          <div>
            <div className="stat-label" aria-label="Rainfall threshold">Threshold</div>
            <div className="stat-value text-sm" aria-label="Rainfall threshold">≤50mm</div>
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
        <button className="btn btn-outline" onClick={handleClaim} aria-label="Claim payout">
          Claim Payout ({pool.state === 1 ? 'Triggered' : 'Pool not triggered'})
        </button>
      </div>
    </div>
  )
}

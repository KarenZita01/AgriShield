import { useState } from 'react'

interface InvestorProps {
  pool: any
  wallet: any
}

export default function InvestorView({ pool, wallet }: InvestorProps) {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  if (!wallet.connected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💰</div>
        <h3 className="mb-2">Investor Dashboard</h3>
        <p className="text-sm text-muted">
          Connect your wallet to provide liquidity and earn premiums.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Liquidity</span>
        </div>
        <div className="stat-grid">
          <div>
            <div className="stat-label">Deposited</div>
            <div className="stat-value">0.00 mUSD</div>
          </div>
          <div>
            <div className="stat-label">Share</div>
            <div className="stat-value text-sm">0%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Deposit Liquidity</span>
        </div>
        <p className="text-sm text-muted mb-2">
          Provide liquidity to earn a share of premiums. You bear risk if claims exceed pool balance.
        </p>
        <div className="input-group">
          <label>Amount (mUSD)</label>
          <input
            className="input"
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" disabled={!depositAmount}>
          Deposit
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Withdraw Liquidity</span>
        </div>
        <button
          className="btn btn-outline"
          disabled={withdrawing}
          onClick={() => setWithdrawing(true)}
        >
          {withdrawing ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  )
}

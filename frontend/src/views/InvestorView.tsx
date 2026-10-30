import { useState } from 'react'
import { useToasts } from '../hooks/useToasts'

interface InvestorProps {
  pool: any
  wallet: any
}

export default function InvestorView({ pool, wallet }: InvestorProps) {
  const { addToast } = useToasts()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [depositing, setDepositing] = useState(false)

  const parseDeposit = (value: string): number | null => {
    const num = parseFloat(value)
    if (!isFinite(num) || num <= 0) return null
    return num
  }

  const handleDeposit = () => {
    const amount = parseDeposit(depositAmount)
    if (!amount) {
      addToast('Enter a valid deposit amount greater than 0', 'error')
      return
    }
    setDepositing(true)
    addToast(`Queued deposit of ${amount.toFixed(2)} mUSD`, 'success')
    setTimeout(() => setDepositing(false), 1500)
  }

  const handleWithdraw = () => {
    if (!wallet.connected) {
      addToast('Connect your wallet to withdraw', 'error')
      return
    }
    setWithdrawing(true)
    addToast('Withdrawal transaction queued', 'info')
  }

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
            <div className="stat-label" aria-label="Deposited amount">Deposited</div>
            <div className="stat-value" aria-label="Deposited amount">0.00 mUSD</div>
          </div>
          <div>
            <div className="stat-label" aria-label="Pool share">Share</div>
            <div className="stat-value text-sm" aria-label="Pool share">0%</div>
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
            aria-label="Deposit amount in mUSD"
            min="0"
            step="0.01"
          />
        </div>
        <button className="btn btn-primary" disabled={depositing || !parseDeposit(depositAmount)} onClick={handleDeposit} aria-label="Deposit liquidity">
          {depositing ? 'Depositing...' : 'Deposit'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Pool Info</span>
        </div>
        <div className="stat-grid">
          <div>
            <div className="stat-label">Total Farmers</div>
            <div className="stat-value text-sm">{pool.farmerCount}</div>
          </div>
          <div>
            <div className="stat-label">Solvency</div>
            <div className="stat-value text-sm">{(pool.solvencyRatio / 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="stat-label">Pool Balance</div>
            <div className="stat-value text-sm">{pool.poolBalance !== undefined ? ((pool.poolBalance as number) / 10_000_000).toFixed(2) : '0.00'} mUSD</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Withdraw Liquidity</span>
        </div>
        <button
          className="btn btn-outline"
          disabled={withdrawing}
          onClick={handleWithdraw}
          aria-label="Withdraw liquidity"
        >
          {withdrawing ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  )
}

import Stat from '../components/Stat'
import ThresholdGauge from '../components/ThresholdGauge'
import WeatherCard from '../components/WeatherCard'

interface DashboardProps {
  pool: any
  wallet: any
}

const STATE_LABELS: Record<number, string> = {
  0: 'Active',
  1: 'Triggered',
  2: 'Paid Out',
  3: 'Closed',
}

const STATE_CLASSES: Record<number, string> = {
  0: 'status-active',
  1: 'status-triggered',
  2: 'status-paid',
  3: 'status-closed',
}

export default function DashboardView({ pool, wallet }: DashboardProps) {
  const formatAmount = (val: string) => {
    const num = parseInt(val) || 0
    return (num / 10_000_000).toFixed(2)
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Pool Status</span>
          <span className={`status-badge ${STATE_CLASSES[pool.state] || 'status-active'}`}>
            {STATE_LABELS[pool.state] || 'Unknown'}
          </span>
        </div>

        <div className="stat-grid">
          <Stat label="Farmers" value={pool.farmerCount} icon="👨‍🌾" />
          <Stat label="Claims" value={pool.claimedCount} icon="📋" />
          <Stat label="Liquidity" value={`${formatAmount(pool.totalLiquidity)} mUSD`} icon="💧" />
          <Stat label="Premiums" value={`${formatAmount(pool.totalPremiums)} mUSD`} icon="💵" />
        </div>

        <div className="mt-4">
          <ThresholdGauge ratio={pool.solvencyRatio} />
        </div>
      </div>

      <WeatherCard />

      <div className="card">
        <div className="card-header">
          <span className="card-title">Pool Metrics</span>
        </div>
        <div className="stat-grid">
          <Stat label="Last Reading" value={`#${pool.lastReadingId}`} icon="📡" />
          <Stat label="Payouts" value={`${formatAmount(pool.totalPayouts)} mUSD`} icon="💸" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Quick Actions</span>
        </div>
        {!wallet.connected ? (
          <p className="text-sm text-muted text-center">
            Connect your Freighter wallet to interact with the pool.
          </p>
        ) : (
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
              Enroll as Farmer
            </button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
              Provide Liquidity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

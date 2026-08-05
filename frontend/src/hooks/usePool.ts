import { useState, useCallback, useEffect } from 'react'
import { getConfig } from '../config'

interface PoolState {
  state: number
  paused: boolean
  farmerCount: number
  claimedCount: number
  totalLiquidity: string
  totalPremiums: string
  totalPayouts: string
  solvencyRatio: number
  poolBalance: string
  liability: string
  lastReadingId: number
  loading: boolean
  error: string | null
}

const initialState: PoolState = {
  state: 0,
  paused: false,
  farmerCount: 0,
  claimedCount: 0,
  totalLiquidity: '0',
  totalPremiums: '0',
  totalPayouts: '0',
  solvencyRatio: 10000,
  poolBalance: '0',
  liability: '0',
  lastReadingId: 0,
  loading: false,
  error: null,
}

export function usePool() {
  const [poolData, setPoolData] = useState<PoolState>(initialState)

  const fetchPoolData = useCallback(async () => {
    setPoolData(prev => ({ ...prev, loading: true, error: null }))
    try {
      const config = getConfig()
      if (!config.poolContractId) {
        setPoolData(prev => ({ ...prev, loading: false }))
        return
      }

      // Use Horizon to fetch contract data
      const response = await fetch(`${config.horizonUrl}/contracts/${config.poolContractId}`)
      if (response.ok) {
        const data = await response.json()
        setPoolData(prev => ({
          ...prev,
          state: data.state ?? 0,
          paused: data.paused ?? false,
          farmerCount: data.farmer_count ?? 0,
          claimedCount: data.claimed_count ?? 0,
          totalLiquidity: data.total_liquidity ?? '0',
          totalPremiums: data.total_premiums ?? '0',
          totalPayouts: data.total_payouts ?? '0',
          solvencyRatio: data.solvency_ratio ?? 10000,
          poolBalance: data.pool_balance ?? '0',
          liability: data.liability ?? '0',
          lastReadingId: data.last_reading_id ?? 0,
          loading: false,
        }))
      } else {
        setPoolData(prev => ({ ...prev, loading: false }))
      }
    } catch (err) {
      setPoolData(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch pool data',
      }))
    }
  }, [])

  useEffect(() => {
    fetchPoolData()
    const interval = setInterval(fetchPoolData, 30000)
    return () => clearInterval(interval)
  }, [fetchPoolData])

  return {
    ...poolData,
    refresh: fetchPoolData,
  }
}

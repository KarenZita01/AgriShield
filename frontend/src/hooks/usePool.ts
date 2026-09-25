import { useState, useCallback, useEffect } from 'react'
import { getConfig } from '../config'
import { SorobanRpc, Contract, xdr } from '@stellar/stellar-sdk'

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

/** Simulate a read-only contract function and return the raw XDR result value. */
async function simulateRead(
  server: SorobanRpc.Server,
  contractId: string,
  method: string
): Promise<xdr.ScVal | null> {
  const contract = new Contract(contractId)
  const tx = {
    // Minimal transaction envelope for simulation — no real source account needed
    // for read-only calls; Soroban RPC accepts a placeholder.
    transaction: contract.call(method),
  } as unknown as Parameters<typeof server.simulateTransaction>[0]

  try {
    const result = await server.simulateTransaction(
      new (await import('@stellar/stellar-sdk')).Transaction(
        contract.call(method).toXDR('base64'),
        (await import('@stellar/stellar-sdk')).Networks.TESTNET
      )
    )
    if (SorobanRpc.Api.isSimulationSuccess(result) && result.result) {
      return result.result.retval
    }
  } catch {
    // Simulation failure — return null so callers fall back gracefully
  }
  return null
}

/** Read a u32 value returned by a contract function. */
function scValToU32(val: xdr.ScVal | null): number {
  if (!val) return 0
  try { return val.u32() } catch { return 0 }
}

/** Read a bool value returned by a contract function. */
function scValToBool(val: xdr.ScVal | null): boolean {
  if (!val) return false
  try { return val.b() } catch { return false }
}

/** Read an i128 value returned as a string (avoids BigInt overflow in display). */
function scValToI128String(val: xdr.ScVal | null): string {
  if (!val) return '0'
  try {
    const parts = val.i128()
    const hi = BigInt(parts.hi().toString())
    const lo = BigInt(parts.lo().toString())
    return ((hi << 64n) | lo).toString()
  } catch { return '0' }
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

      const server = new SorobanRpc.Server(config.rpcUrl, { allowHttp: false })

      // Fire all read-only contract calls in parallel
      const [
        stateVal,
        pausedVal,
        farmerCountVal,
        claimedCountVal,
        totalLiquidityVal,
        totalPremiumsVal,
        totalPayoutsVal,
        solvencyRatioVal,
        poolBalanceVal,
        liabilityVal,
        lastReadingIdVal,
      ] = await Promise.all([
        simulateRead(server, config.poolContractId, 'state'),
        simulateRead(server, config.poolContractId, 'is_paused'),
        simulateRead(server, config.poolContractId, 'farmer_count'),
        simulateRead(server, config.poolContractId, 'claimed_count'),
        simulateRead(server, config.poolContractId, 'total_liquidity'),
        simulateRead(server, config.poolContractId, 'total_premiums'),
        simulateRead(server, config.poolContractId, 'total_payouts'),
        simulateRead(server, config.poolContractId, 'solvency_ratio'),
        simulateRead(server, config.poolContractId, 'pool_balance'),
        simulateRead(server, config.poolContractId, 'liability'),
        simulateRead(server, config.poolContractId, 'last_reading_id'),
      ])

      setPoolData(prev => ({
        ...prev,
        state: scValToU32(stateVal),
        paused: scValToBool(pausedVal),
        farmerCount: scValToU32(farmerCountVal),
        claimedCount: scValToU32(claimedCountVal),
        totalLiquidity: scValToI128String(totalLiquidityVal),
        totalPremiums: scValToI128String(totalPremiumsVal),
        totalPayouts: scValToI128String(totalPayoutsVal),
        solvencyRatio: scValToU32(solvencyRatioVal),
        poolBalance: scValToI128String(poolBalanceVal),
        liability: scValToI128String(liabilityVal),
        lastReadingId: scValToU32(lastReadingIdVal),
        loading: false,
      }))
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

  return { ...poolData, refresh: fetchPoolData }
}

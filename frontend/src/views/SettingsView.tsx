import { useState, useEffect } from 'react'
import { useToasts } from '../hooks/useToasts'

const STORAGE_KEY = 'agrishield_settings'

export default function SettingsView() {
  const { addToast } = useToasts()
  const [rpcUrl, setRpcUrl] = useState(import.meta.env.VITE_RPC_URL || '')
  const [poolId, setPoolId] = useState(import.meta.env.VITE_POOL_CONTRACT_ID || '')
  const [tokenId, setTokenId] = useState(import.meta.env.VITE_TOKEN_CONTRACT_ID || '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.rpcUrl === 'string') setRpcUrl(s.rpcUrl)
        if (typeof s.poolId === 'string') setPoolId(s.poolId)
        if (typeof s.tokenId === 'string') setTokenId(s.tokenId)
      }
    } catch {}
  }, [])

  const handleSave = () => {
    if (!poolId.startsWith('C') || poolId.length < 56) {
      addToast('Invalid Pool Contract ID (stellar contract IDs start with C)', 'error')
      return
    }
    if (!tokenId.startsWith('C') || tokenId.length < 56) {
      addToast('Invalid Token Contract ID (stellar contract IDs start with C)', 'error')
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rpcUrl, poolId, tokenId }))
    } catch {}
    addToast('Settings saved to localStorage', 'success')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Settings</span>
        </div>
        <p className="text-sm text-muted mb-2">
          Configure contract connections. Changes require environment variables.
        </p>
      </div>

      <div className="card">
        <div className="input-group">
          <label>RPC URL</label>
          <input
            className="input"
            value={rpcUrl}
            onChange={e => setRpcUrl(e.target.value)}
            placeholder="https://soroban-testnet.stellar.org"
            autoComplete="off"
          />
        </div>
        <div className="input-group">
          <label>Pool Contract ID</label>
          <input
            className="input"
            value={poolId}
            onChange={e => setPoolId(e.target.value)}
            placeholder="CBIWI..."
            autoComplete="off"
          />
        </div>
        <div className="input-group">
          <label>Token Contract ID</label>
          <input
            className="input"
            value={tokenId}
            onChange={e => setTokenId(e.target.value)}
            placeholder="CCXCW..."
            autoComplete="off"
          />
            className="input"
            value={tokenId}
            onChange={e => setTokenId(e.target.value)}
            placeholder="CCXCW..."
          />
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

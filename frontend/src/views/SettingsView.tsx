import { useState } from 'react'

export default function SettingsView() {
  const [rpcUrl, setRpcUrl] = useState(import.meta.env.VITE_RPC_URL || '')
  const [poolId, setPoolId] = useState(import.meta.env.VITE_POOL_CONTRACT_ID || '')
  const [tokenId, setTokenId] = useState(import.meta.env.VITE_TOKEN_CONTRACT_ID || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Settings are stored in .env, show info message
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
          />
        </div>
        <div className="input-group">
          <label>Pool Contract ID</label>
          <input
            className="input"
            value={poolId}
            onChange={e => setPoolId(e.target.value)}
            placeholder="CBIWI..."
          />
        </div>
        <div className="input-group">
          <label>Token Contract ID</label>
          <input
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

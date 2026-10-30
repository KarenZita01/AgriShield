import { useWallet } from '../hooks/WalletProvider'

export default function WalletButton() {
  const { address, connected, connect, disconnect, loading } = useWallet()

  if (connected && address) {
    return (
      <button className="btn btn-outline btn-sm" onClick={disconnect} aria-label="Disconnect wallet">
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    )
  }

  return (
    <button className="btn btn-primary btn-sm" onClick={connect} disabled={loading} aria-busy={loading} aria-label={loading ? 'Connecting wallet' : 'Connect wallet'}>
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

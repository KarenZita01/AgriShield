import { useState, useEffect } from 'react'
import { WalletProvider, useWallet } from './hooks/WalletProvider'
import { usePool } from './hooks/usePool'
import { useToasts, ToastProvider } from './hooks/useToasts'
import { initAnalytics, initErrorMonitoring, trackPageView, trackEvent } from './lib/analytics'
import { getConfig } from './config'
import DashboardView from './views/DashboardView'
import FarmerView from './views/FarmerView'
import InvestorView from './views/InvestorView'
import FeedbackView from './views/FeedbackView'
import SettingsView from './views/SettingsView'
import AboutView from './views/AboutView'
import WalletButton from './components/WalletButton'

type Tab = 'dashboard' | 'farmer' | 'investor' | 'feedback' | 'about' | 'settings'

function AppContent() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const wallet = useWallet()
  const pool = usePool()
  const config = getConfig()
  const notConfigured = !config.poolContractId || !config.tokenContractId

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'farmer', label: 'Farmer', icon: '🌱' },
    { id: 'investor', label: 'Investor', icon: '💰' },
    { id: 'feedback', label: 'Feedback', icon: '📝' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  useEffect(() => {
    trackPageView(tab)
  }, [tab])

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="header">
        <div className="header-left">
          <h1 className="logo" aria-label="AgriShield">🌾 AgriShield</h1>
          <span className="badge" aria-label="Testnet">Testnet</span>
        </div>
        <WalletButton />
      </header>

      {notConfigured && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-header">
            <span className="card-title">Configuration Required</span>
          </div>
          <p className="text-sm text-danger">
            Pool or token contract not configured. Set VITE_POOL_CONTRACT_ID and
            VITE_TOKEN_CONTRACT_ID, or save them in Settings.
          </p>
        </div>
      )}

      <main className="main" id="main-content">
        {tab === 'dashboard' && <DashboardView pool={pool} wallet={wallet} />}
        {tab === 'farmer' && <FarmerView pool={pool} wallet={wallet} />}
        {tab === 'investor' && <InvestorView pool={pool} wallet={wallet} />}
        {tab === 'feedback' && <FeedbackView />}
        {tab === 'about' && <AboutView />}
        {tab === 'settings' && <SettingsView />}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-label={t.label}
            aria-pressed={tab === t.id}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    initAnalytics()
    initErrorMonitoring()
  }, [])

  return (
    <ToastProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ToastProvider>
  )
}

import { useState } from 'react'
import { WalletProvider, useWallet } from './hooks/WalletProvider'
import { usePool } from './hooks/usePool'
import { useToasts, ToastProvider } from './hooks/useToasts'
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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'farmer', label: 'Farmer', icon: '🌱' },
    { id: 'investor', label: 'Investor', icon: '💰' },
    { id: 'feedback', label: 'Feedback', icon: '📝' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🌾 AgriShield</h1>
          <span className="badge">Testnet</span>
        </div>
        <WalletButton />
      </header>

      <main className="main">
        {tab === 'dashboard' && <DashboardView pool={pool} wallet={wallet} />}
        {tab === 'farmer' && <FarmerView pool={pool} wallet={wallet} />}
        {tab === 'investor' && <InvestorView pool={pool} wallet={wallet} />}
        {tab === 'feedback' && <FeedbackView />}
        {tab === 'about' && <AboutView />}
        {tab === 'settings' && <SettingsView />}
      </main>

      <nav className="bottom-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
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
  return (
    <ToastProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ToastProvider>
  )
}

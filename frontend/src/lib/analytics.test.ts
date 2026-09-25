import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────
// Mock PostHog so tests never make real network calls
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
  },
}))

// Stub import.meta.env before importing analytics
vi.stubEnv('VITE_POSTHOG_KEY', 'test-key')
vi.stubEnv('VITE_SENTRY_DSN', '')

// Import after mocks are set up
const { initAnalytics, trackPageView, trackEvent } = await import('./analytics')

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── initAnalytics ──────────────────────────────────────────
  it('initAnalytics does not throw', () => {
    expect(() => initAnalytics()).not.toThrow()
  })

  it('initAnalytics is safe to call multiple times', () => {
    expect(() => {
      initAnalytics()
      initAnalytics()
    }).not.toThrow()
  })

  // ── trackPageView ──────────────────────────────────────────
  it('trackPageView does not throw for valid tab names', () => {
    const tabs = ['dashboard', 'farmer', 'investor', 'feedback', 'about', 'settings']
    tabs.forEach(tab => {
      expect(() => trackPageView(tab)).not.toThrow()
    })
  })

  it('trackPageView accepts unknown page names without throwing', () => {
    expect(() => trackPageView('unknown-page')).not.toThrow()
  })

  it('trackPageView does not throw with empty string', () => {
    expect(() => trackPageView('')).not.toThrow()
  })

  // ── trackEvent ─────────────────────────────────────────────
  it('trackEvent does not throw for standard events', () => {
    const events = [
      ['wallet_connected', { wallet: 'freighter' }],
      ['farmer_enrolled', { address: 'GABC...1234' }],
      ['liquidity_deposited', { amount: '100' }],
      ['payout_claimed', { farmer: 'GABC...1234' }],
      ['feedback_submitted', {}],
    ] as const
    events.forEach(([name, props]) => {
      expect(() => trackEvent(name, props)).not.toThrow()
    })
  })

  it('trackEvent does not throw with no properties', () => {
    expect(() => trackEvent('test_event')).not.toThrow()
  })

  it('trackEvent does not throw with undefined properties', () => {
    expect(() => trackEvent('test_event', undefined)).not.toThrow()
  })
})

const ANALYTICS_KEY = import.meta.env.VITE_POSTHOG_KEY || ''
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''

// PostHog Analytics (lightweight)
export function initAnalytics() {
  if (!ANALYTICS_KEY) {
    console.log('[Analytics] No PostHog key configured, analytics disabled')
    return
  }

  // PostHog snippet
  ;(function (t, e) {
    var o, n, p, r
    e.__SV ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split('.')
          2 == o.length && ((t = t[o[0]]), (e = o[1])),
            (t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
            })
        }
        ;((p = t.createElement('script')).type = 'text/javascript'),
          (p.async = !0),
          (p.src = s.api_host + '/static/array.js'),
          (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r)
        var u = e
        for (
          void 0 !== a ? (u = e[a] = []) : (a = 'posthog'),
            u.people = u.people || [],
            u.toString = function (t) {
              var e = 'posthog'
              return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e
            },
            u.people.toString = function () {
              return u.toString(1) + '.people (stub)'
            },
            o = 'capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId'.split(
              ' '
            ),
            n = 0;
          n < o.length;
          n++
        )
          g(u, o[n])
        e._i.push([i, s, a])
      }),
      (e.__SV = 1))
  })(document, window.posthog || [])

  posthog.init(ANALYTICS_KEY, {
    api_host: 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  })

  console.log('[Analytics] PostHog initialized')
}

// Track custom events
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(event, properties)
  }
}

// Track page views
export function trackPageView(page: string) {
  trackEvent('page_viewed', { page })
}

// Track user actions
export function trackWalletConnected(address: string) {
  trackEvent('wallet_connected', { address: address.slice(0, 6) + '...' })
}

export function trackFarmerEnrolled(address: string) {
  trackEvent('farmer_enrolled', { address: address.slice(0, 6) + '...' })
}

export function trackLiquidityDeposited(amount: string) {
  trackEvent('liquidity_deposited', { amount })
}

export function trackPayoutClaimed(amount: string) {
  trackEvent('payout_claimed', { amount })
}

export function trackFeedbackSubmitted(rating: number) {
  trackEvent('feedback_submitted', { rating })
}

// Sentry Error Monitoring (optional)
export function initErrorMonitoring() {
  if (!SENTRY_DSN) {
    console.log('[Monitoring] No Sentry DSN configured, error monitoring disabled')
    return
  }

  // Lightweight error boundary - logs errors to console
  window.addEventListener('error', (event) => {
    console.error('[Error]', event.message, event.filename, event.lineno)
    trackEvent('error_occurred', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason)
    trackEvent('unhandled_rejection', {
      reason: String(event.reason),
    })
  })

  console.log('[Monitoring] Error monitoring initialized')
}

// Health check - ping analytics periodically
export function startHealthCheck() {
  setInterval(() => {
    trackEvent('health_check', {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
  }, 300000) // every 5 minutes
}

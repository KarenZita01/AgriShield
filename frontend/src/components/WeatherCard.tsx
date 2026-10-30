import { useState, useEffect, useCallback } from 'react'

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  timestamp: string
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWeather = useCallback(async () => {
    setRefreshing(true)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=10.495&longitude=7.527&current=temperature_2m,relative_humidity_2m,rain&timezone=Africa/Lagos'
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.current) {
        setWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          rainfall: data.current.rain,
          timestamp: data.current.time,
        })
      }
    } catch (err) {
      console.error('Weather fetch failed:', err)
      setError(err instanceof Error ? err.message : 'Weather fetch failed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 600000) // every 10 min
    return () => clearInterval(interval)
  }, [fetchWeather])

  if (loading) {
    return (
      <div className="card">
        <div className="loading"><div className="spinner" /></div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">🌤️</div>
          <p className="text-sm text-muted">{error || 'Weather data unavailable'}</p>
          {!loading && !refreshing && (
            <button className="btn btn-outline btn-sm" onClick={fetchWeather} aria-label="Refresh weather" style={{ marginTop: 8 }}>
              Refresh
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title" aria-label="Weather card for Kaduna">Weather — Kaduna</span>
        <span className="text-sm text-muted">Live</span>
      </div>
        <div className="stat-grid">
          <div>
            <div className="stat-label">Temperature</div>
            <div className="stat-value">{weather.temperature}°C</div>
          </div>
          <div>
            <div className="stat-label">Humidity</div>
            <div className="stat-value">{weather.humidity}%</div>
          </div>
          <div>
            <div className="stat-label">Rainfall</div>
            <div className="stat-value">{weather.rainfall} mm</div>
          </div>
          <div>
            <div className="stat-label">Status</div>
            <div className={`stat-value ${weather.rainfall <= 50 ? 'text-danger' : ''}`}>
              {weather.rainfall <= 50 ? '⚠️ Below' : '✅ Safe'}
            </div>
          </div>
        </div>
        {error && (
          <p className="text-xs text-danger text-center" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
        <button className="btn btn-outline btn-sm" onClick={fetchWeather} style={{ marginTop: 8, width: 'auto' }}>
          Refresh
        </button>
      </div>
  )
}

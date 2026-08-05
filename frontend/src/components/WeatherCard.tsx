import { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  timestamp: string
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=10.495&longitude=7.527&current=temperature_2m,relative_humidity_2m,rain&timezone=Africa/Lagos'
        )
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
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
    const interval = setInterval(fetchWeather, 600000) // every 10 min
    return () => clearInterval(interval)
  }, [])

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
          <p className="text-sm text-muted">Weather data unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Weather — Kaduna</span>
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
    </div>
  )
}

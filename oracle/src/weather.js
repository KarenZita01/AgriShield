const MAX_RAINFALL_MM = 1000
const FETCH_TIMEOUT_MS = 15000

export async function fetchWeather(latitude, longitude, retries = 3) {
  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude: ${latitude}`)
  }
  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${longitude}`)
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=rain&timezone=Africa/Lagos`

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()

      if (!data.current || typeof data.current.rain !== 'number') {
        throw new Error('Invalid weather response structure')
      }

      const weatherTime = data.current.time
      if (!weatherTime) {
        throw new Error('Missing weather observation time')
      }

      let rainfall = Number(data.current.rain)
      if (!Number.isFinite(rainfall)) {
        throw new Error('Rainfall value is not a finite number')
      }
      if (rainfall < 0) {
        throw new Error(`Rainfall cannot be negative: ${rainfall}`)
      }
      if (rainfall > MAX_RAINFALL_MM) {
        throw new Error(`Rainfall implausibly high: ${rainfall}mm (capped at ${MAX_RAINFALL_MM})`)
      }

      return {
        rainfall,
        timestamp: Math.floor(new Date(weatherTime).getTime() / 1000),
      }
    } catch (err) {
      clearTimeout(timeout)
      console.error(`Weather fetch attempt ${attempt}/${retries} failed:`, err.message)
      if (attempt === retries) {
        throw err
      }
      await sleep(Math.pow(2, attempt) * 1000)
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

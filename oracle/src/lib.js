export function deriveReadingId(timestamp) {
  if (Number.isNaN(timestamp) || timestamp <= 0) {
    throw new Error(`Invalid timestamp for reading id: ${timestamp}`)
  }
  return BigInt(timestamp)
}

export function toScaled(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) {
    throw new Error(`toScaled: value is not finite: ${value}`)
  }
  return BigInt(Math.round(num * 10_000_000))
}

export function formatMm(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '? mm'
  return (num / 10_000_000).toFixed(2) + ' mm'
}

export function computeDiff(a, b) {
  const x = Number(a)
  const y = Number(b)
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error(`computeDiff: inputs must be finite`)
  }
  return Math.abs(x - y)
}

export function isWithinTolerance(diff, tolerance) {
  if (!Number.isFinite(diff) || !Number.isFinite(tolerance)) {
    throw new Error(`isWithinTolerance: inputs must be finite`)
  }
  return diff <= tolerance
}

export function checkAgreement(oracleA, oracleB, tolerance) {
  if (tolerance < 0) {
    throw new Error(`checkAgreement: tolerance must be >= 0, got ${tolerance}`)
  }
  const diff = computeDiff(oracleA, oracleB)
  return isWithinTolerance(diff, toScaled(tolerance))
}

export function isBreach(value, threshold) {
  if (!Number.isFinite(value) || !Number.isFinite(threshold)) {
    throw new Error(`isBreach: value and threshold must be finite`)
  }
  return value <= threshold
}

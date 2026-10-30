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

export function checkAgreement(oracleA, oracleB, tolerance) {
  if (tolerance < 0) {
    throw new Error(`checkAgreement: tolerance must be >= 0, got ${tolerance}`)
  }
  const diff = oracleA > oracleB ? oracleA - oracleB : oracleB - oracleA
  return diff <= toScaled(tolerance)
}

export function isBreach(value, threshold) {
  if (!Number.isFinite(value) || !Number.isFinite(threshold)) {
    throw new Error(`isBreach: value and threshold must be finite`)
  }
  return value <= threshold
}

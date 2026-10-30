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
  const diff = oracleA > oracleB ? oracleA - oracleB : oracleB - oracleA
  // tolerance is in mm (same units as the raw weather value), so scale it
  // before comparing against the already-scaled oracleA/oracleB values.
  return diff <= toScaled(tolerance)
}

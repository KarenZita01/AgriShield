export function deriveReadingId(timestamp) {
  return BigInt(timestamp)
}

export function toScaled(value) {
  return BigInt(Math.round(value * 10_000_000))
}

export function checkAgreement(oracleA, oracleB, tolerance) {
  const diff = oracleA > oracleB ? oracleA - oracleB : oracleB - oracleA
  // tolerance is in mm (same units as the raw weather value), so scale it
  // before comparing against the already-scaled oracleA/oracleB values.
  return diff <= toScaled(tolerance)
}

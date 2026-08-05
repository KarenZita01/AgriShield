import { config } from './config.js'

export function deriveReadingId(timestamp) {
  return BigInt(timestamp)
}

export function toScaled(value) {
  return BigInt(Math.round(value * 10_000_000))
}

export function checkAgreement(oracleA, oracleB, tolerance) {
  const diff = oracleA > oracleB ? oracleA - oracleB : oracleB - oracleA
  return diff <= BigInt(tolerance)
}

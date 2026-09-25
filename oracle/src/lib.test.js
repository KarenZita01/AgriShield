import { describe, it } from 'node:test'
import assert from 'node:assert'
import { deriveReadingId, toScaled, checkAgreement } from './lib.js'

describe('lib', () => {
  // ── deriveReadingId ───────────────────────────────────────
  it('deriveReadingId returns bigint from timestamp', () => {
    const id = deriveReadingId(1700000000)
    assert.strictEqual(typeof id, 'bigint')
    assert.strictEqual(id, 1700000000n)
  })

  it('deriveReadingId handles large timestamps (year 9999)', () => {
    const id = deriveReadingId(253402300799)
    assert.strictEqual(id, 253402300799n)
  })

  it('deriveReadingId handles zero', () => {
    assert.strictEqual(deriveReadingId(0), 0n)
  })

  // ── toScaled ─────────────────────────────────────────────
  it('toScaled converts float to scaled bigint', () => {
    const result = toScaled(25.5)
    assert.strictEqual(result, 255000000n)
  })

  it('toScaled rounds correctly', () => {
    const result = toScaled(0.1234567)
    assert.strictEqual(result, 1234567n)
  })

  it('toScaled handles zero', () => {
    assert.strictEqual(toScaled(0), 0n)
  })

  it('toScaled handles whole numbers', () => {
    assert.strictEqual(toScaled(50), 500000000n)
  })

  // ── checkAgreement ────────────────────────────────────────
  // NOTE: tolerance is in mm (raw value), same unit as the weather reading
  // before scaling. checkAgreement internally calls toScaled(tolerance) so
  // callers pass e.g. 10 to mean "10mm tolerance".

  it('checkAgreement returns true when within tolerance (mm)', () => {
    // oracle_a = 10mm, oracle_b = 10.5mm, tolerance = 1mm → agree
    const a = toScaled(10)
    const b = toScaled(10.5)
    assert.strictEqual(checkAgreement(a, b, 1), true)
  })

  it('checkAgreement returns false when exceeds tolerance (mm)', () => {
    // oracle_a = 10mm, oracle_b = 25mm, tolerance = 10mm → disagree
    const a = toScaled(10)
    const b = toScaled(25)
    assert.strictEqual(checkAgreement(a, b, 10), false)
  })

  it('checkAgreement returns true on exact match', () => {
    const a = toScaled(30)
    assert.strictEqual(checkAgreement(a, a, 0), true)
  })

  it('checkAgreement handles reversed order (a > b)', () => {
    // oracle_a = 25mm, oracle_b = 10mm, tolerance = 10mm → disagree
    const a = toScaled(25)
    const b = toScaled(10)
    assert.strictEqual(checkAgreement(a, b, 10), false)
  })

  it('checkAgreement returns true at exact tolerance boundary (mm)', () => {
    // oracle_a = 10mm, oracle_b = 20mm, tolerance = 10mm → exactly at boundary → agree
    const a = toScaled(10)
    const b = toScaled(20)
    assert.strictEqual(checkAgreement(a, b, 10), true)
  })

  it('checkAgreement returns false just over tolerance boundary (mm)', () => {
    // oracle_a = 10mm, oracle_b = 20.0000001mm, tolerance = 10mm → just over → disagree
    const a = toScaled(10)
    const b = toScaled(10) + toScaled(10) + 1n // one scaled unit over
    assert.strictEqual(checkAgreement(a, b, 10), false)
  })
})

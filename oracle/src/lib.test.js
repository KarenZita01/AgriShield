import { describe, it } from 'node:test'
import assert from 'node:assert'
import { deriveReadingId, toScaled, checkAgreement } from './lib.js'

describe('lib', () => {
  it('deriveReadingId returns bigint from timestamp', () => {
    const id = deriveReadingId(1700000000)
    assert.strictEqual(typeof id, 'bigint')
    assert.strictEqual(id, 1700000000n)
  })

  it('toScaled converts float to scaled bigint', () => {
    const result = toScaled(25.5)
    assert.strictEqual(result, 255000000n)
  })

  it('toScaled rounds correctly', () => {
    const result = toScaled(0.1234567)
    assert.strictEqual(result, 1234567n)
  })

  it('checkAgreement returns true when within tolerance', () => {
    const a = 100000000n
    const b = 105000000n
    assert.strictEqual(checkAgreement(a, b, 10000000), true)
  })

  it('checkAgreement returns false when exceeds tolerance', () => {
    const a = 100000000n
    const b = 120000000n
    assert.strictEqual(checkAgreement(a, b, 10000000), false)
  })

  it('checkAgreement handles exact match', () => {
    const a = 100000000n
    assert.strictEqual(checkAgreement(a, a, 10), true)
  })

  it('checkAgreement handles reversed order', () => {
    const a = 120000000n
    const b = 100000000n
    assert.strictEqual(checkAgreement(a, b, 10000000), false)
  })

  it('toScaled handles zero', () => {
    assert.strictEqual(toScaled(0), 0n)
  })

  it('deriveReadingId handles large timestamps', () => {
    const id = deriveReadingId(253402300799) // year 9999
    assert.strictEqual(id, 253402300799n)
  })
})

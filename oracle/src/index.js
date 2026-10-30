import { config, validateConfig } from './config.js'
import { fetchWeather } from './weather.js'
import { deriveReadingId, toScaled, checkAgreement, isBreach } from './lib.js'
import { Keypair, SorobanRpc, Contract, Address, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

const SUBMIT_RETRY = config.maxSubmitRetries
let consecutiveFailures = 0
const CIRCUIT_BREAKER_THRESHOLD = 5
let lastSubmittedReadingId = null
let lastSuccessfulSubmission = null
let isPolling = false
let shutdownRequested = false
const metrics = { submissions: 0, successes: 0, failures: 0, duplicates: 0, circuitBreakerOpens: 0 }
const CIRCUIT_RESET_MS = 5 * 60 * 1000
let circuitOpenedAt = null

function log(level, message, meta = {}) {
  console.log(JSON.stringify({ level, timestamp: new Date().toISOString(), message, ...meta }))
}

async function simulateSubmit(sourceKeypair, readingId, timestamp, value) {
  const server = new SorobanRpc.Server(config.rpcUrl, { allowHttp: true })
  const contract = new Contract(config.poolContractId)
  const tx = new TransactionBuilder(await server.getAccount(sourceKeypair.publicKey()), {
    fee: '100000',
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        'submit_reading',
        new Address(sourceKeypair.publicKey()).toScVal(),
        xdr.Uint64.fromBigInt(BigInt(readingId)),
        xdr.Uint64.fromBigInt(BigInt(timestamp)),
        xdr.Int128Parts.fromBigInt(BigInt(value))
      )
    )
    .setTimeout(30)
    .build()
  tx.sign(sourceKeypair)
  return server.simulateTransaction(tx)
}

async function submitReading(readingId, timestamp, value) {
  const nowMs = Date.now()
  if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    if (circuitOpenedAt && nowMs - circuitOpenedAt >= CIRCUIT_RESET_MS) {
      log('INFO', 'Circuit breaker reset after cooldown', { consecutiveFailures })
      consecutiveFailures = 0
      circuitOpenedAt = null
    } else {
      metrics.circuitBreakerOpens++
      log('WARN', 'Circuit breaker open, skipping submission', { consecutiveFailures })
      return { status: 'CIRCUIT_BREAKER_OPEN' }
    }
  }
  if (lastSubmittedReadingId !== null && readingId <= lastSubmittedReadingId) {
    metrics.duplicates++
    log('WARN', 'Non-monotonic reading id skipped', { readingId, last: lastSubmittedReadingId.toString() })
    return { status: 'DUPLICATE' }
  }
  const sourceKeypair = Keypair.fromSecret(config.oracleSecretKey)
  let lastErr
  for (let attempt = 1; attempt <= SUBMIT_RETRY; attempt++) {
    try {
      const sim = await simulateSubmit(sourceKeypair, readingId, timestamp, value)
      if (config.dryRun) {
        log('INFO', 'Dry run: simulation succeeded, not sending', { readingId })
        metrics.submissions++
        metrics.successes++
        lastSubmittedReadingId = readingId
        lastSuccessfulSubmission = Date.now()
        return { status: 'DRY_RUN_OK', simulation: sim }
      }
      const server = new SorobanRpc.Server(config.rpcUrl, { allowHttp: true })
      const sourceAccount = await server.getAccount(sourceKeypair.publicKey())
      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: config.networkPassphrase,
      })
      const tx = txBuilder
        .addOperation(
          contract.call(
            'submit_reading',
            new Address(sourceKeypair.publicKey()).toScVal(),
            xdr.Uint64.fromBigInt(BigInt(readingId)),
            xdr.Uint64.fromBigInt(BigInt(timestamp)),
            xdr.Int128Parts.fromBigInt(BigInt(value))
          )
        )
        .setTimeout(30)
        .build()
      tx.sign(sourceKeypair)
      const result = await server.sendTransaction(tx)
      log('INFO', 'Reading submitted', { readingId, tx: result.hash, status: result.status })
      consecutiveFailures = 0
      metrics.submissions++
      metrics.successes++
      lastSubmittedReadingId = readingId
      lastSuccessfulSubmission = Date.now()
      if (result.status === 'ERROR') {
        log('ERROR', 'Transaction error', { resultXdr: result.resultXdr })
      }
      return result
    } catch (err) {
      lastErr = err
      log('WARN', `Submit attempt ${attempt}/${SUBMIT_RETRY} failed`, { readingId, error: err.message })
      if (attempt < SUBMIT_RETRY) await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
  consecutiveFailures++
  metrics.submissions++
  metrics.failures++
  if (circuitOpenedAt === null) circuitOpenedAt = nowMs
  log('ERROR', 'Reading submission failed after retries', { readingId, error: lastErr.message })
  throw lastErr
}

async function poll() {
  if (isPolling) {
    log('WARN', 'Previous poll still in flight, skipping')
    return
  }
  isPolling = true
  try {
    log('INFO', 'Fetching weather')
    const weather = await fetchWeather(config.latitude, config.longitude)
    log('INFO', 'Weather fetched', { rainfall: weather.rainfall, threshold: config.threshold })
    const readingId = deriveReadingId(weather.timestamp)
    const rawMm = weather.rainfall / 10_000_000
    const scaledValue = toScaled(weather.rainfall)
    log('INFO', 'Derived reading', { readingId: readingId.toString(), rawMm, scaledValue: scaledValue.toString(), breach: isBreach(weather.rainfall, config.threshold) })
    await submitReading(readingId, weather.timestamp, scaledValue)
    log('INFO', 'Poll complete', { metrics: getMetrics() })
  } catch (err) {
    log('ERROR', 'Poll error', { error: err.message })
  } finally {
    isPolling = false
    process.emit('poll-done')
    if (shutdownRequested) {
      log('INFO', 'Shutdown requested, exiting after poll')
      process.exit(0)
    }
  }
}

export function getMetrics() {
  return {
    ...metrics,
    lastSuccessfulSubmission,
    lastSubmittedReadingId: lastSubmittedReadingId ? lastSubmittedReadingId.toString() : null,
    consecutiveFailures,
    circuitBreakerOpen: consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD,
  }
}

export function healthcheck() {
  return {
    status: consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD ? 'degraded' : 'ok',
    circuitBreakerOpen: consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD,
    consecutiveFailures,
    metrics: getMetrics(),
  }
}

export { poll }

async function main() {
  validateConfig()
  console.log('AgriShield Oracle started')
  console.log(`Pool: ${config.poolContractId}`)
  console.log(`Lat: ${config.latitude}, Lon: ${config.longitude}`)
  console.log(`Poll interval: ${config.pollIntervalMs}ms`)
  await poll()
  const interval = setInterval(poll, config.pollIntervalMs)

  const shutdown = () => {
    console.log('Shutting down oracle...')
    clearInterval(interval)
    const forceExit = setTimeout(() => process.exit(1), 10000)
    const graceful = () => {
      clearTimeout(forceExit)
      process.exit(0)
    }
    if (!isPolling) graceful()
    else process.once('poll-done', graceful)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()

import { config, validateConfig } from './config.js'
import { fetchWeather } from './weather.js'
import { deriveReadingId, toScaled } from './lib.js'
import { Keypair, SorobanRpc, Contract, Address, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

const SUBMIT_RETRY = 3
let consecutiveFailures = 0
const CIRCUIT_BREAKER_THRESHOLD = 5
let lastSubmittedReadingId = null

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
  if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    log('WARN', 'Circuit breaker open, skipping submission', { consecutiveFailures })
    return { status: 'CIRCUIT_BREAKER_OPEN' }
  }
  if (lastSubmittedReadingId === readingId) {
    log('INFO', 'Duplicate reading id skipped', { readingId })
    return { status: 'DUPLICATE' }
  }
  const sourceKeypair = Keypair.fromSecret(config.oracleSecretKey)
  let lastErr
  for (let attempt = 1; attempt <= SUBMIT_RETRY; attempt++) {
    try {
      await simulateSubmit(sourceKeypair, readingId, timestamp, value)
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
      lastSubmittedReadingId = readingId
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
  log('ERROR', 'Reading submission failed after retries', { readingId, error: lastErr.message })
  throw lastErr
}

async function poll() {
  try {
    log('INFO', 'Fetching weather')
    const weather = await fetchWeather(config.latitude, config.longitude)
    log('INFO', 'Weather fetched', { rainfall: weather.rainfall, threshold: config.threshold })
    const readingId = deriveReadingId(weather.timestamp)
    const scaledValue = toScaled(weather.rainfall)
    await submitReading(readingId, weather.timestamp, scaledValue)
  } catch (err) {
    log('ERROR', 'Poll error', { error: err.message })
  }
}

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
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()

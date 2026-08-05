import { config, validateConfig } from './config.js'
import { fetchWeather } from './weather.js'
import { deriveReadingId, toScaled } from './lib.js'
import { Keypair, SorobanRpc, Contract, Address, xdr } from '@stellar/stellar-sdk'

async function submitReading(readingId, timestamp, value) {
  const sourceKeypair = Keypair.fromSecret(config.oracleSecretKey)
  const server = new SorobanRpc.Server(config.rpcUrl, { allowHttp: true })

  const contract = new Contract(config.poolContractId)
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
  console.log(`Reading submitted: reading_id=${readingId}, tx=${result.hash}`)

  if (result.status === 'ERROR') {
    console.error('Transaction error:', result.resultXdr)
  }

  return result
}

async function poll() {
  try {
    console.log(`[${new Date().toISOString()}] Fetching weather...`)
    const weather = await fetchWeather(config.latitude, config.longitude)

    console.log(`Rainfall: ${weather.rainfall}mm, Threshold: ${config.threshold}mm`)

    const readingId = deriveReadingId(weather.timestamp)
    const scaledValue = toScaled(weather.rainfall)

    await submitReading(readingId, weather.timestamp, scaledValue)
  } catch (err) {
    console.error('Poll error:', err.message)
  }
}

async function main() {
  validateConfig()
  console.log('AgriShield Oracle started')
  console.log(`Pool: ${config.poolContractId}`)
  console.log(`Lat: ${config.latitude}, Lon: ${config.longitude}`)
  console.log(`Poll interval: ${config.pollIntervalMs}ms`)

  await poll()
  setInterval(poll, config.pollIntervalMs)
}

main()

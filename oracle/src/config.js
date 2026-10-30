export const config = Object.freeze({
  rpcUrl: process.env.RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: process.env.NETWORK_PASSPHRASE || 'Test SDF Future Network ; October 2022',
  poolContractId: process.env.POOL_CONTRACT_ID || '',
  tokenContractId: process.env.TOKEN_CONTRACT_ID || '',
  oracleSecretKey: process.env.ORACLE_SECRET_KEY || '',
  latitude: parseFloat(process.env.LATITUDE || '10.495'),
  longitude: parseFloat(process.env.LONGITUDE || '7.527'),
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '3600000'), // 1 hour
  threshold: parseInt(process.env.THRESHOLD || '50'),
  tolerance: parseInt(process.env.TOLERANCE || '10'),
})

export function validateConfig() {
  const required = ['poolContractId', 'oracleSecretKey']
  const missing = required.filter(k => !config[k])
  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`)
  }
  if (!/^https:/i.test(config.rpcUrl)) {
    throw new Error(`Invalid RPC URL: ${config.rpcUrl} (must use https)`)
  }
  if (Number.isNaN(config.latitude) || config.latitude < -90 || config.latitude > 90) {
    throw new Error(`Invalid latitude: ${config.latitude} (must be -90 to 90)`)
  }
  if (Number.isNaN(config.longitude) || config.longitude < -180 || config.longitude > 180) {
    throw new Error(`Invalid longitude: ${config.longitude} (must be -180 to 180)`)
  }
  if (config.oracleSecretKey.length < 32) {
    throw new Error('Invalid oracleSecretKey: expected a Stellar secret seed (>=32 chars)')
  }
  if (config.tokenContractId && !config.tokenContractId.startsWith('C')) {
    throw new Error(`Invalid tokenContractId: ${config.tokenContractId} (must start with C)`)
  }
  if (config.threshold < 0) {
    throw new Error(`Invalid threshold: ${config.threshold} (must be >= 0)`)
  }
  if (config.tolerance < 0) {
    throw new Error(`Invalid tolerance: ${config.tolerance} (must be >= 0)`)
  }
  if (config.pollIntervalMs < 1000) {
    throw new Error(`Invalid poll interval: ${config.pollIntervalMs}ms (must be >= 1000ms)`)
  }
}

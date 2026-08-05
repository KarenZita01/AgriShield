export const config = {
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
}

export function validateConfig() {
  const required = ['poolContractId', 'oracleSecretKey']
  const missing = required.filter(k => !config[k])
  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`)
  }
}

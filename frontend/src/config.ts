export interface AppConfig {
  rpcUrl: string
  networkPassphrase: string
  poolContractId: string
  tokenContractId: string
  horizonUrl: string
  posthogKey: string
  sentryDsn: string
}

const defaultConfig: AppConfig = {
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Future Network ; October 2022',
  poolContractId: '',
  tokenContractId: '',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  posthogKey: '',
  sentryDsn: '',
}

export function getConfig(): AppConfig {
  return {
    rpcUrl: import.meta.env.VITE_RPC_URL || defaultConfig.rpcUrl,
    networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE || defaultConfig.networkPassphrase,
    poolContractId: import.meta.env.VITE_POOL_CONTRACT_ID || defaultConfig.poolContractId,
    tokenContractId: import.meta.env.VITE_TOKEN_CONTRACT_ID || defaultConfig.tokenContractId,
    horizonUrl: import.meta.env.VITE_HORIZON_URL || defaultConfig.horizonUrl,
    posthogKey: import.meta.env.VITE_POSTHOG_KEY || defaultConfig.posthogKey,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || defaultConfig.sentryDsn,
  }
}

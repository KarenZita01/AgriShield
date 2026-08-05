# Deployment Runbook

## Prerequisites

- Stellar CLI (`stellar`) v26+
- Rust with `wasm32v1-none` target
- Node.js 18+
- Vercel CLI (for frontend)

## Contract Deployment

```bash
# Build WASM
cd contracts
cargo build --release --target wasm32v1-none

# Deploy token
stellar contract deploy \
  --wasm target/wasm32v1-none/release/micro_usd.wasm \
  --source deployer \
  --network testnet

# Deploy pool
stellar contract deploy \
  --wasm target/wasm32v1-none/release/insurance_pool.wasm \
  --source deployer \
  --network testnet
```

## Initialize Contracts

```bash
# Initialize token
stellar contract invoke <TOKEN_ID> -- initialize \
  --admin <ADMIN_ADDR> \
  --name USD --symbol mUSD --decimals 7

# Initialize pool (use PoolConfig struct)
stellar contract invoke <POOL_ID> -- initialize \
  --admin <ADMIN_ADDR> \
  --config '{"admin":"...","oracle_a":"...","oracle_b":"...","token":"...","region":"NG_KAD","latitude":10495,"longitude":7527,"metric":0,"threshold":50,"premium":10000000,"coverage":500000000,"window_start":1000,"window_end":2000,"min_liquidity":100000000,"payout_window":86400,"tolerance":10}'
```

## Frontend Deployment

```bash
cd frontend
npm install
npm run build
vercel deploy --prod
```

## Oracle Setup

```bash
cd oracle
npm install
cp .env.example .env
# Fill in ORACLE_SECRET_KEY, POOL_CONTRACT_ID
npm start
```

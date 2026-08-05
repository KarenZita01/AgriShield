# AgriShield Architecture

## Overview

AgriShield is a parametric micro-insurance pool built on Stellar/Soroban that protects smallholder farmers in Nigeria against drought using weather-indexed triggers.

## Components

### Smart Contracts (Soroban/Rust)

**Insurance Pool Contract** (`CBIWIRJXYPJYMGHS52GU3C6NJTVMNKNRFFKTGBYWQ4R3RQSNGGG6O45G`)
- Pool lifecycle: Active → Triggered → PaidOut → Closed
- Dual-oracle weather trigger (both oracles must agree within tolerance)
- Solvency guard (enrollment gated on balance >= (farmers+1) * coverage)
- 28 typed error codes
- 7 emitted events

**MicroUSD Token Contract** (`CCXCW2SCJB4E6FOKAP6MTASQE4CL2QOYHWUILTYIE6JQRMY7KALKURWU`)
- SEP-41-compatible stablecoin with 7 decimals
- Mintable by admin for liquidity provisioning
- Standard transfer, approve, transfer_from operations

### Frontend (React + TypeScript + Vite)

- Mobile-first responsive design
- Freighter wallet integration
- Dashboard, Farmer, Investor, Feedback, Settings, About views
- Real-time weather data from Open-Meteo API

### Oracle (Node.js)

- Dual-oracle model (oracle-a and oracle-b)
- Open-Meteo weather API for rainfall data
- Retry logic with exponential backoff
- Reads signing key from environment

## Data Flow

1. Oracle polls Open-Meteo API every hour
2. Both oracles submit rainfall readings to pool contract
3. If readings agree and breach threshold (≤50mm), pool triggers
4. Enrolled farmers can claim proportional payouts
5. Liquidity providers bear residual risk

## Deployment

- Contracts deployed to Stellar Testnet via Soroban CLI
- Frontend deployed to Vercel
- Oracle runs as standalone Node.js process

## Security

- Auth required for all state-changing operations
- Dual-oracle agreement prevents single-point manipulation
- Solvency guard prevents over-enrollment
- Payout window limits claim duration

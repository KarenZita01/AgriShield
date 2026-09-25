# Glossary

Definitions for domain and technical terms used throughout the AgriShield codebase and documentation.

---

## Domain Terms

**Parametric Insurance**
Insurance that pays out based on a measurable parameter (e.g. rainfall in mm) rather than an assessed loss. When the parameter crosses a threshold, payment is triggered automatically — no claims adjuster needed.

**Smallholder Farmer**
A farmer who cultivates a small plot of land (typically less than 2 hectares) using primarily household labour. AgriShield targets smallholder farmers in Kaduna, Nigeria.

**Coverage**
The maximum payout amount a farmer receives if the pool is triggered. Currently set at 50 mUSD (500,000,000 scaled units).

**Premium**
The amount a farmer pays to enroll for coverage. Currently set at 1 mUSD (10,000,000 scaled units).

**Trigger / Breach**
The event that activates payouts. Occurs when two oracles agree that rainfall ≤ threshold (50 mm by default) within the observation window.

**Observation Window**
The time range (`window_start` to `window_end` Unix timestamps) during which oracle readings are valid. Readings outside this window are rejected.

**Payout Window**
The duration (in seconds) after a breach during which enrolled farmers can claim their payout. Defaults to 86,400 seconds (24 hours).

**Solvency Guard**
A contract-enforced check that prevents new enrollments if the pool balance would fall below `(farmers + 1) × coverage`. Protects investors from under-collateralised pools.

**Solvency Ratio**
`(pool_balance / liability) × 10,000` expressed in basis points. A ratio of 10,000 bps = 100% solvency (pool can cover all outstanding liability exactly). Displayed on the dashboard.

**Liquidity Provider / Investor**
An account that deposits mUSD into the pool to back coverage. Providers earn a share of premiums and can withdraw (subject to solvency constraints).

---

## Stellar / Soroban Terms

**Stellar**
A decentralised payment network and blockchain. AgriShield runs on the Stellar Testnet.

**Soroban**
Stellar's smart contract platform. AgriShield's core logic is implemented as a Soroban contract written in Rust.

**XLM / Lumen**
The native asset of the Stellar network, used to pay transaction fees and meet minimum account reserves.

**Horizon**
Stellar's REST API for querying the ledger (account balances, transactions, etc.). Does not expose Soroban contract state — use Soroban RPC for that.

**Soroban RPC**
The JSON-RPC endpoint for interacting with Soroban smart contracts — submitting transactions and simulating calls.

**Freighter**
A browser extension wallet for Stellar. Used by AgriShield users to sign transactions.

**SEP-41**
Stellar Ecosystem Proposal 41 — the standard interface for fungible tokens on Soroban. AgriShield's MicroUSD token implements SEP-41.

**mUSD (MicroUSD)**
AgriShield's internal stablecoin used for premiums and payouts. Has 7 decimal places; 1 mUSD = 10,000,000 scaled units.

**WASM / wasm32v1-none**
The compilation target for Soroban contracts. Smart contracts are compiled to WebAssembly and deployed to the Stellar network.

**Ledger Timestamp**
Unix timestamp provided by the Stellar ledger, used as the authoritative time source for oracle readings and window enforcement.

---

## Oracle Terms

**Oracle**
An off-chain service that submits real-world data (rainfall readings) to the smart contract. AgriShield uses a dual-oracle model.

**Dual-Oracle Model**
Two independent oracle instances (oracle-a and oracle-b) must both submit readings and agree within `tolerance` for the reading to be considered valid. Prevents a single oracle from triggering payouts.

**Tolerance**
The maximum difference (in mm) between two oracle readings that is still considered agreement. Configured at pool initialisation. Default: 10 mm.

**Reading ID**
A unique identifier for an oracle reading, derived from the Unix timestamp of the observation.

**Scaled Value**
Rainfall values are multiplied by 10,000,000 before being stored on-chain to preserve decimal precision without floating-point numbers. A rainfall of 25.5 mm = 255,000,000 scaled units.

**Open-Meteo**
The free, open-source weather API used by the oracle to fetch rainfall data. No API key required.

---

## Contract State Terms

**PoolState**
The lifecycle state of the insurance pool:
- `Active (0)` — accepting enrollments and liquidity
- `Triggered (1)` — breach confirmed, payouts available
- `PaidOut (2)` — all farmers have claimed
- `Closed (3)` — pool is closed, admin can withdraw remainder

**LOCKED_BALANCE**
The total amount of tokens currently committed to active coverage obligations. Cannot be withdrawn.

**DataKey**
Soroban storage key enum used to organise all persistent contract data (Config, State, Farmer records, Provider records, Readings, counters).

---

## Development Terms

**`toScaled(value)`**
Helper function in `oracle/src/lib.js` that converts a floating-point rainfall value (mm) to a scaled integer for on-chain storage: `BigInt(Math.round(value × 10_000_000))`.

**`checkAgreement(a, b, tolerance)`**
Returns `true` if two scaled oracle readings differ by no more than `toScaled(tolerance)`. Tolerance is passed in mm.

**`deriveReadingId(timestamp)`**
Converts a Unix timestamp integer to a `BigInt` for use as an on-chain reading ID.

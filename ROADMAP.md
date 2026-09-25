# Roadmap

AgriShield's planned features, improvements, and milestones. This is a living document — priorities may shift based on community feedback.

Status legend: ✅ Done · 🚧 In Progress · 📋 Planned · 💡 Under Consideration

---

## v0.1.0 — Testnet Launch ✅

- ✅ Insurance Pool smart contract (Soroban / Rust)
- ✅ MicroUSD SEP-41 token contract
- ✅ Dual-oracle model with rainfall threshold trigger
- ✅ Solvency guard on enrollment and withdrawals
- ✅ Oracle Node.js daemon (Open-Meteo integration)
- ✅ React + TypeScript frontend with 6 views
- ✅ Freighter wallet integration
- ✅ 10 farmer onboarding on Testnet
- ✅ PostHog analytics
- ✅ Demo video
- ✅ CI pipeline (contracts, oracle, frontend)
- ✅ Community health files (CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)

---

## v0.2.0 — Stability & DX 🚧

- 📋 Increase test coverage to ≥ 80% across all components
- 📋 Add frontend E2E tests (Playwright)
- 📋 Oracle: add health-check endpoint for uptime monitoring
- 📋 Oracle: structured JSON logging (replace `console.log`)
- 📋 Frontend: error boundary improvements and offline fallback UI
- 📋 Frontend: loading skeleton states while contract data fetches
- 📋 `oracle/package-lock.json` committed for reproducible installs
- 📋 Prettier + ESLint enforced in CI
- 📋 Dependabot / Renovate for automated dependency updates

---

## v0.3.0 — Oracle Hardening

- 📋 Support for multiple weather data sources (fallback chain)
- 📋 Oracle key management improvements (env-based key rotation)
- 📋 Oracle: retry on Soroban RPC failures with exponential backoff
- 📋 Oracle: metrics endpoint (uptime, readings submitted, last reading timestamp)
- 📋 On-chain oracle reading history viewer in the frontend
- 📋 Alert on oracle staleness (no reading in > 2 hours)

---

## v0.4.0 — Farmer & Investor UX

- 📋 UI pages for escrow and stream features (currently API-only)
- 📋 Farmer dashboard: rainfall history chart
- 📋 Farmer dashboard: countdown to payout window expiry
- 📋 Investor dashboard: yield calculations and projected returns
- 📋 Mobile PWA improvements: offline pool state caching
- 📋 Multi-language UI (Hausa — primary language of Kaduna farmers)
- 📋 QR code enrollment flow for feature-phone-friendly onboarding

---

## v0.5.0 — Multi-Region & Multi-Crop

- 💡 Support multiple insurance pools (one per region / crop type)
- 💡 Configurable weather metrics beyond rainfall (temperature, wind speed)
- 💡 Pool factory contract for permissionless pool creation
- 💡 Governance contract for parameter changes (threshold, premium, coverage)
- 💡 On-chain DAO voting for pool configuration updates

---

## v1.0.0 — Mainnet Readiness

- 📋 Full third-party security audit of smart contracts
- 📋 Mainnet deployment checklist completed (see `docs/DEPLOYMENT.md`)
- 📋 Real USD-backed stablecoin integration (USDC on Stellar)
- 📋 Real oracle key custody (HSM or multi-sig oracle keys)
- 📋 Multiple independent oracle operators
- 📋 Legal / regulatory review for Nigeria and target markets
- 📋 Mainnet deployment with real liquidity

---

## Under Consideration 💡

- Crop yield oracle (satellite imagery via third-party API)
- Integration with African mobile money providers for XLM on-ramp
- DAO treasury for self-sustaining pool operations
- Academic partnership for impact measurement
- Open API for other developers to build on AgriShield pools

---

## Feedback

Have a feature idea? Open a [feature request](https://github.com/KarenZita01/AgriShield/issues/new?template=feature_request.md) or start a discussion in GitHub Discussions.

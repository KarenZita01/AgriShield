# Changelog

All notable changes to AgriShield are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- `.github/ISSUE_TEMPLATE/bug_report.md` — structured bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` — structured feature request template
- `.github/pull_request_template.md` — PR checklist template
- `CHANGELOG.md` — this file
- `CITATION.cff` — academic citation metadata
- `GLOSSARY.md` — domain and technical term definitions
- `GOVERNANCE.md` — project roles and decision-making process
- `MAINTAINERS.md` — maintainer list and area ownership
- `ROADMAP.md` — planned features and milestones
- `frontend/.env.example` — documents all required VITE_ environment variables
- `.github/workflows/ci.yml` — CI pipeline for contracts, oracle, and frontend
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
- `CONTRIBUTING.md` — contributor guide with setup and PR checklist
- `SECURITY.md` — vulnerability reporting and disclosure policy

### Fixed
- `oracle/src/index.js` — added missing `TransactionBuilder` import (was crashing at runtime)
- `oracle/src/lib.js` — removed unused `config` import; fixed tolerance unit mismatch in `checkAgreement` (now correctly scales mm tolerance via `toScaled`)
- `frontend/src/hooks/usePool.ts` — replaced non-existent Horizon `/contracts/` endpoint with proper Soroban RPC simulate calls
- `oracle/src/lib.test.js` — updated `checkAgreement` tests to pass tolerance in mm, matching the scaling fix
- `contracts/micro-usd/src/test.rs` — brought `env` into scope in all test functions (was compile error)
- `contracts/insurance-pool/src/test.rs` — exposed admin from `create_pool`; replaced invalid `.collect()` with `vec![]` macro

### Changed
- Repository renamed from `Parametric-Micro-Insurance-Pool` to `AgriShield`
- License changed from BSD-2-Clause to MIT
- README: updated all GitHub links, clone commands, project structure, and license badge

---

## [0.1.0] — 2026-01-15

### Added
- Initial release of AgriShield on Stellar Testnet
- `Insurance Pool` Soroban smart contract — enrollment, liquidity, dual-oracle trigger, payouts
- `MicroUSD Token` — SEP-41-compatible stablecoin with 7 decimals
- Oracle service — Node.js daemon fetching rainfall from Open-Meteo API
- Frontend — React + TypeScript dashboard (Farmer, Investor, Dashboard, Feedback, About, Settings views)
- Freighter wallet integration
- Dual-oracle model — both oracles must agree within tolerance before pool triggers
- Solvency guard — enrollment gated on `balance >= (farmers + 1) × coverage`
- 28 typed error codes in the contract
- PostHog analytics integration
- 10 farmer onboarding records on Testnet
- Demo video and screenshots

### Contracts (Testnet)
- Insurance Pool: `CBIWIRJXYPJYMGHS52GU3C6NJTVMNKNRFFKTGBYWQ4R3RQSNGGG6O45G`
- MicroUSD Token: `CCXCW2SCJB4E6FOKAP6MTASQE4CL2QOYHWUILTYIE6JQRMY7KALKURWU`

[Unreleased]: https://github.com/KarenZita01/AgriShield/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/KarenZita01/AgriShield/releases/tag/v0.1.0

# Contributing to AgriShield

Thank you for your interest in contributing to AgriShield — parametric micro-insurance for smallholder farmers on Stellar/Soroban. Every contribution, large or small, helps protect farming communities from climate risk.

---

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch & Commit Conventions](#branch--commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Code of Conduct](#code-of-conduct)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/AgriShield.git
   cd AgriShield
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/KarenZita01/AgriShield.git
   ```

---

## How to Contribute

- **Bug fixes** — open an issue first to confirm the bug, then submit a PR
- **New features** — open an issue to discuss before building
- **Documentation** — always welcome, no issue needed
- **Tests** — additional test coverage is always appreciated
- **Oracle improvements** — weather data reliability and Soroban integration are active areas

---

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend & Oracle |
| Rust + Cargo | stable | Smart Contracts |
| Stellar CLI | v26+ | Contract deployment |
| Freighter Wallet | latest | Browser wallet for testing |

### Smart Contracts

```bash
cd contracts
cargo build --release --target wasm32v1-none
cargo test
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env.local   # fill in contract IDs
npm run dev
```

### Oracle

```bash
cd oracle
npm install
cp .env.example .env         # fill in ORACLE_SECRET_KEY and contract IDs
npm start
```

---

## Branch & Commit Conventions

**Branch naming:**
```
feat/short-description
fix/short-description
docs/short-description
chore/short-description
```

**Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org):
```
feat: add rainfall history chart to dashboard
fix: correct tolerance scaling in oracle agreement check
docs: update deployment instructions for mainnet
chore: bump soroban-sdk to v22
```

---

## Pull Request Process

1. Create your branch from `main`
2. Make your changes with passing tests
3. Ensure CI passes (contracts, oracle, frontend all green)
4. Open a PR against `main` with a clear title and description
5. Describe **what** changed and **why**
6. Link any related issues with `Closes #<issue-number>`
7. A maintainer will review within a few days

**PR checklist:**
- [ ] Tests added or updated
- [ ] `cargo test` passes (if contract changes)
- [ ] `npm test` passes (oracle and/or frontend)
- [ ] TypeScript type check passes (`npx tsc --noEmit` in `frontend/`)
- [ ] No `.env` files or secrets committed
- [ ] Documentation updated if behaviour changed

---

## Testing Requirements

| Component | Command | Minimum |
|-----------|---------|---------|
| Contracts | `cargo test` | All existing tests pass |
| Oracle | `npm test` | All 9 unit tests pass |
| Frontend | `npm test` | All existing tests pass |

New features should include tests. Bug fixes should include a regression test where practical.

---

## Code Style

**Rust (contracts):** standard `rustfmt` formatting — run `cargo fmt` before committing.

**JavaScript (oracle):** ESM modules, no framework. Keep functions small and pure where possible.

**TypeScript (frontend):** follow existing patterns in the codebase. No `any` types without a comment explaining why.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/KarenZita01/AgriShield/issues) and include:

- A clear title and description
- Steps to reproduce
- Expected vs actual behaviour
- Relevant logs or screenshots
- Network (Testnet/Mainnet) and environment details

---

## Suggesting Features

Open a [GitHub Issue](https://github.com/KarenZita01/AgriShield/issues) with the label `enhancement` and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered
- How it fits AgriShield's mission of protecting smallholder farmers

---

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

**Built with ❤️ for the Stellar ecosystem and the farming communities of Nigeria.**

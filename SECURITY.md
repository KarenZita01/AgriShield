# Security Policy

## Supported Versions

AgriShield is currently in active testnet development. The following versions receive security updates:

| Version | Supported |
|---------|-----------|
| `main` branch | ✅ Active |
| Older branches | ❌ Not supported |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability in AgriShield — including the smart contracts, oracle service, or frontend — please report it responsibly:

1. **Open a [GitHub Security Advisory](https://github.com/KarenZita01/AgriShield/security/advisories/new)** (private, visible only to maintainers)
2. Include as much detail as possible:
   - A clear description of the vulnerability
   - The affected component (contract / oracle / frontend)
   - Steps to reproduce or a proof-of-concept
   - The potential impact
   - Any suggested fix if you have one

You will receive an acknowledgement within **72 hours** and a more detailed response within **7 days** indicating next steps.

---

## Scope

The following are **in scope** for security reports:

| Component | Examples |
|-----------|---------|
| **Smart Contracts** | Reentrancy, unauthorised fund access, oracle manipulation, solvency bypass, incorrect payout logic |
| **Oracle Service** | Spoofed weather readings, replay attacks on `submit_reading`, private key exposure |
| **Frontend** | XSS, wallet session hijacking, sensitive data leakage, insecure contract interaction |
| **Configuration** | Secrets committed to the repository, exposed API keys |

The following are **out of scope:**

- Stellar/Soroban protocol-level vulnerabilities (report to the [Stellar Bug Bounty](https://www.stellar.org/bug-bounty-program))
- Open-Meteo API issues (report to Open-Meteo directly)
- Vulnerabilities requiring physical access to a user's device
- Social engineering attacks

---

## Smart Contract Security Notes

- The Insurance Pool contract uses a **dual-oracle model** — both oracles must agree within tolerance before a payout trigger, reducing single-oracle manipulation risk
- Admin functions (`pause`, `unpause`, `close_pool`, `admin_withdraw`) are protected by `require_auth()` and restricted to the admin address set at `initialize`
- Liquidity withdrawals are **solvency-gated** — withdrawals that would break `balance >= farmers × coverage` are rejected
- The contract has **28 typed error codes** for precise on-chain error handling
- No upgradeable proxy pattern is used — the contract is immutable once deployed

---

## Disclosure Policy

Once a vulnerability is confirmed and a fix is available:

1. A patched version will be deployed (testnet)
2. A [GitHub Security Advisory](https://github.com/KarenZita01/AgriShield/security/advisories) will be published
3. The reporter will be credited (unless they prefer to remain anonymous)

We ask that reporters allow **14 days** from the fix being deployed before any public disclosure.

---

## Known Limitations (Testnet)

- The oracle secret key is held by a single operator — this is acceptable for testnet but would require a multi-signer or TEE solution for mainnet
- Weather data relies on a single external API (Open-Meteo) — mainnet should use multiple independent data sources
- There is no on-chain governance for oracle rotation yet

These are tracked as known issues and are not considered vulnerabilities in the current testnet context.

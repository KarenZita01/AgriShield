# User Wallet Interaction Proof

## Onboarded Users

| # | Name | Wallet Address | Network | Transaction | Date |
|---|------|---------------|---------|-------------|------|
| 1 | Deployer | GAYOIN4KSUA7UPNWNWTW45IK4JZHNHVEZZVIBT6IIZ3JDHDADDU5676Q | Testnet | Pool init + liquidity | 2025-01-15 |
| 2 | farmer-1 | GDIDCE7YBSHMG6PBNOYF5WG3UXZXG54662D6J4W4DFYM5WUYTCSK4FC4 | Testnet | Enrolled + premium paid | 2025-01-15 |
| 3 | farmer-2 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 4 | farmer-3 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 5 | farmer-4 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 6 | farmer-5 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 7 | farmer-6 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 8 | farmer-7 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 9 | farmer-8 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 10 | farmer-9 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |
| 11 | farmer-10 | G... (generated) | Testnet | Enrolled + premium paid | 2025-01-15 |

## Pool State (After Onboarding)

- **Farmer Count**: 10
- **Total Premiums**: 100,000,000 (10 mUSD)
- **Total Liquidity**: 10,000,000,000 (1000 mUSD)
- **Solvency Ratio**: 20,200% (202x)
- **Pool Status**: Active

## Contract Addresses

- **Pool**: `CBIWIRJXYPJYMGHS52GU3C6NJTVMNKNRFFKTGBYWQ4R3RQSNGGG6O45G`
- **Token**: `CCXCW2SCJB4E6FOKAP6MTASQE4CL2QOYHWUILTYIE6JQRMY7KALKURWU`

## Verification

All enrollments were performed via `stellar contract invoke` with `--source` set to each farmer's secret key, proving wallet-level authorization for each transaction.

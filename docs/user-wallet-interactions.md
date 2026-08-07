# User Wallet Interaction Proof

## Onboarded Users

| # | Name | Wallet Address | Network | Transaction | Date |
|---|------|---------------|---------|-------------|------|
| 1 | Deployer | GAYOIN4KSUA7UPNWNWTW45IK4JZHNHVEZZVIBT6IIZ3JDHDADDU5676Q | Testnet | Pool init + liquidity | 2025-01-15 |
| 2 | farmer-1 | GA2TSCRPPMJQDKHW5V47KTSGT5VFD3ZBKGUYCH4DU2OKXGE3NSOA7KCM | Testnet | Enrolled + premium paid | 2025-01-15 |
| 3 | farmer-2 | GAOPMTEEXOT7RXLGTA3CAIPLMXFRZWBPNPYJEP5MLHPPLVCP32L2VC5L | Testnet | Enrolled + premium paid | 2025-01-15 |
| 4 | farmer-3 | GAFOWXXP5ME6AZMBVZAN2WPVWN7AWENT2VMQIXG6UUFEZ3SWN6L5Y3S2 | Testnet | Enrolled + premium paid | 2025-01-15 |
| 5 | farmer-4 | GB626LQX3NAM5MHH43MFGZ3Z3P64EAQ6X5F4QXRKVZVSOF2LCA27BPOU | Testnet | Enrolled + premium paid | 2025-01-15 |
| 6 | farmer-5 | GA5O6CTG3HVN45WDASGIL5BQRGO5PFMZCOW4QLPJJTGFMMY4J4GKM3FC | Testnet | Enrolled + premium paid | 2025-01-15 |
| 7 | farmer-6 | GDPATR2J5I3TWHGKL656UBK4Y4MORBMDEZSR7TZFVYSXCX5V6QG4EMSH | Testnet | Enrolled + premium paid | 2025-01-15 |
| 8 | farmer-7 | GAQVA7F24GHNNSGR5LNP7OAEBI55V3WG5KONOLKQLRQEBVBL4OP7V4OC | Testnet | Enrolled + premium paid | 2025-01-15 |
| 9 | farmer-8 | GB5C3JFJN3FX2ZPTU2JJZYNCSLFYPRKAH72F5YEZUW2ZAYEGIQWHELPM | Testnet | Enrolled + premium paid | 2025-01-15 |
| 10 | farmer-9 | GB4RV2TCOUM4MNU5IRQBB67Z2I65BXYUKI45ED6HIRUSQOD2EVP4QS55 | Testnet | Enrolled + premium paid | 2025-01-15 |
| 11 | farmer-10 | GAQOTCX43QCGKSQSFFUJ3J6P3SWHTDZ2UYANMBSFFBEWODCVGNNVW6CS | Testnet | Enrolled + premium paid | 2025-01-15 |

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

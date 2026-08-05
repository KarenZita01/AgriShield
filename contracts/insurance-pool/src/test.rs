#![cfg(test)]

use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

use crate::{InsurancePool, InsurancePoolClient, PoolConfig};

fn create_token(env: &Env) -> (Address, micro_usd::MicroUSDClient) {
    let contract_addr = env.register_contract(None, micro_usd::MicroUSD);
    let client = micro_usd::MicroUSDClient::new(env, &contract_addr);
    let admin = Address::generate(env);
    client.initialize(
        &admin,
        &symbol_short!("USD"),
        &symbol_short!("mUSD"),
        &7u32,
    );
    (contract_addr, client)
}

fn create_pool(
    env: &Env,
    token_addr: &Address,
    oracle_a: &Address,
    oracle_b: &Address,
) -> (Address, InsurancePoolClient) {
    let contract_addr = env.register_contract(None, InsurancePool);
    let client = InsurancePoolClient::new(env, &contract_addr);
    let admin = Address::generate(env);
    let config = PoolConfig {
        admin: admin.clone(),
        oracle_a: oracle_a.clone(),
        oracle_b: oracle_b.clone(),
        token: token_addr.clone(),
        region: symbol_short!("NG_KAD"),
        latitude: 10495i64,
        longitude: 7527i64,
        metric: 0u32,
        threshold: 50i128,
        premium: 10_000_000i128,
        coverage: 500_000_000i128,
        window_start: 1000u64,
        window_end: 2000u64,
        min_liquidity: 100_000_000i128,
        payout_window: 86400u64,
        tolerance: 10i128,
    };
    client.initialize(&admin, &config);
    (contract_addr, client)
}

fn setup() -> (Env, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, _token_client) = create_token(&env);
    let deployer = Address::generate(&env);
    let oracle_a = Address::generate(&env);
    let oracle_b = Address::generate(&env);

    let token_client = micro_usd::MicroUSDClient::new(&env, &token_addr);
    token_client.mint(&deployer, &deployer, &10_000_000_000i128);

    for _i in 1..=10 {
        let farmer = Address::generate(&env);
        token_client.mint(&deployer, &farmer, &100_000_000i128);
    }

    (env, token_addr, deployer, oracle_a, oracle_b)
}

#[test]
fn test_initialize() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);
    assert_eq!(client.state(), 0);
    assert_eq!(client.paused(), false);
    assert_eq!(client.farmer_count(), 0);
    assert_eq!(client.claimed_count(), 0);
    assert_eq!(client.total_liquidity(), 0);
    assert_eq!(client.total_premiums(), 0);
    assert_eq!(client.total_payouts(), 0);
}

#[test]
fn test_enroll_farmer() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let farmer = Address::generate(&env);
    client.enroll(&farmer);

    assert_eq!(client.farmer_count(), 1);
    let status = client.farmer_status(&farmer).unwrap();
    assert_eq!(status.claimed, false);
}

#[test]
#[should_panic(expected = "AlreadyEnrolled")]
fn test_enroll_duplicate() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let farmer = Address::generate(&env);
    client.enroll(&farmer);
    client.enroll(&farmer);
}

#[test]
fn test_deposit_liquidity() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let provider = Address::generate(&env);
    client.deposit_liquidity(&provider, &1_000_000_000i128);

    assert_eq!(client.total_liquidity(), 1_000_000_000);
    assert_eq!(client.provider_balance(&provider), 1_000_000_000);
}

#[test]
fn test_submit_reading_partial() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &30i128);

    let reading = client.get_reading(&1u64).unwrap();
    assert_eq!(reading.timestamp, 1500);
    assert_eq!(reading.agreed, false);
}

#[test]
fn test_submit_reading_agreed_no_breach() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &60i128);
    client.submit_reading(&oracle_b, &1u64, &1500u64, &60i128);

    let reading = client.get_reading(&1u64).unwrap();
    assert_eq!(reading.agreed, true);
    assert_eq!(reading.breach, false);
    assert_eq!(client.state(), 0);
}

#[test]
fn test_submit_reading_breach_triggers() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &30i128);
    client.submit_reading(&oracle_b, &1u64, &1500u64, &30i128);

    let reading = client.get_reading(&1u64).unwrap();
    assert_eq!(reading.agreed, true);
    assert_eq!(reading.breach, true);
    assert_eq!(client.state(), 1);
}

#[test]
#[should_panic(expected = "UnauthorizedOracle")]
fn test_submit_unauthorized_oracle() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let bad_oracle = Address::generate(&env);
    client.submit_reading(&bad_oracle, &1u64, &1500u64, &30i128);
}

#[test]
#[should_panic(expected = "OraclesDisagree")]
fn test_submit_reading_disagree() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &30i128);
    client.submit_reading(&oracle_b, &1u64, &1500u64, &100i128);
}

#[test]
fn test_solvency_ratio() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    assert_eq!(client.solvency_ratio(), 10_000);
}

#[test]
fn test_pause_unpause() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    assert_eq!(client.paused(), false);
    client.pause();
    assert_eq!(client.paused(), true);
    client.unpause();
    assert_eq!(client.paused(), false);
}

#[test]
#[should_panic(expected = "PoolStillActive")]
fn test_close_active_pool() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    client.close_pool();
}

#[test]
fn test_close_triggered_pool() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &30i128);
    client.submit_reading(&oracle_b, &1u64, &1500u64, &30i128);

    client.close_pool();
    assert_eq!(client.state(), 3);
}

#[test]
fn test_multiple_readings() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    for i in 1..=5u64 {
        let timestamp = 1000 + i * 100;
        let value = 60 + i as i128;
        client.submit_reading(&oracle_a, &i, &timestamp, &value);
        client.submit_reading(&oracle_b, &i, &timestamp, &value);
    }

    assert_eq!(client.last_reading_id(), 5);
    assert_eq!(client.state(), 0);
}

#[test]
fn test_claim_payout() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let provider = Address::generate(&env);
    client.deposit_liquidity(&provider, &1_000_000_000i128);

    let farmer = Address::generate(&env);
    client.enroll(&farmer);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &30i128);
    client.submit_reading(&oracle_b, &1u64, &1500u64, &30i128);

    client.claim_payout(&farmer);

    let status = client.farmer_status(&farmer).unwrap();
    assert_eq!(status.claimed, true);
    assert!(status.payout_amount > 0);
    assert_eq!(client.claimed_count(), 1);
}

#[test]
#[should_panic(expected = "PoolNotClosed")]
fn test_admin_withdraw_before_close() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let _provider = Address::generate(&env);
    client.deposit_liquidity(&_provider, &1_000_000_000i128);

    let admin = Address::generate(&env);
    client.admin_withdraw(&100_000_000i128);
}

#[test]
fn test_admin_withdraw_after_close() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let provider = Address::generate(&env);
    client.deposit_liquidity(&provider, &1_000_000_000i128);

    client.submit_reading(&oracle_a, &1u64, &1500u64, &30i128);
    client.submit_reading(&oracle_b, &1u64, &1500u64, &30i128);

    let farmer = Address::generate(&env);
    client.enroll(&farmer);
    client.claim_payout(&farmer);
    client.close_pool();

    let balance = client.pool_balance();
    if balance > 0 {
        let admin = Address::generate(&env);
        client.admin_withdraw(&balance);
    }
}

#[test]
fn test_full_lifecycle() {
    let (env, token_addr, _deployer, oracle_a, oracle_b) = setup();
    let (_, client) = create_pool(&env, &token_addr, &oracle_a, &oracle_b);

    let provider = Address::generate(&env);
    client.deposit_liquidity(&provider, &5_000_000_000i128);

    let farmers: soroban_sdk::Vec<Address> = (0..5)
        .map(|_| Address::generate(&env))
        .collect();
    for farmer in farmers.iter() {
        client.enroll(farmer);
    }
    assert_eq!(client.farmer_count(), 5);

    for i in 1..=3u64 {
        client.submit_reading(&oracle_a, &i, &(1000 + i * 100), &80i128);
        client.submit_reading(&oracle_b, &i, &(1000 + i * 100), &80i128);
    }
    assert_eq!(client.state(), 0);

    client.submit_reading(&oracle_a, &4u64, &1400u64, &20i128);
    client.submit_reading(&oracle_b, &4u64, &1400u64, &20i128);
    assert_eq!(client.state(), 1);

    for farmer in farmers.iter() {
        client.claim_payout(farmer);
    }
    assert_eq!(client.claimed_count(), 5);
    assert_eq!(client.state(), 2);
}

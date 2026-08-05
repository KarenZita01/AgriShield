#![cfg(test)]

use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};

use crate::{MicroUSD, MicroUSDClient};

fn setup() -> (Env, MicroUSDClient) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_addr = env.register_contract(None, MicroUSD);
    let client = MicroUSDClient::new(env, &contract_addr);
    let admin = Address::generate(&env);
    client.initialize(&admin, &symbol_short!("USD"), &symbol_short!("mUSD"), &7u32);
    (env, client)
}

#[test]
fn test_name() {
    let (_, client) = setup();
    assert_eq!(client.name(), symbol_short!("USD"));
}

#[test]
fn test_symbol() {
    let (_, client) = setup();
    assert_eq!(client.symbol(), symbol_short!("mUSD"));
}

#[test]
fn test_decimals() {
    let (_, client) = setup();
    assert_eq!(client.decimals(), 7);
}

#[test]
fn test_mint() {
    let (_, client) = setup();
    let admin = Address::generate(&env);
    let to = Address::generate(&env);
    client.mint(&admin, &to, &1_000_000_000i128);
    assert_eq!(client.balance(&to), 1_000_000_000);
}

#[test]
fn test_transfer() {
    let (_, client) = setup();
    let admin = Address::generate(&env);
    let from = Address::generate(&env);
    let to = Address::generate(&env);

    client.mint(&admin, &from, &1_000_000_000i128);
    client.transfer(&from, &to, &500_000_000i128);

    assert_eq!(client.balance(&from), 500_000_000);
    assert_eq!(client.balance(&to), 500_000_000);
}

#[test]
fn test_approve_and_transfer_from() {
    let (_, client) = setup();
    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let spender = Address::generate(&env);
    let to = Address::generate(&env);

    client.mint(&admin, &owner, &1_000_000_000i128);
    client.approve(&owner, &spender, &300_000_000i128);
    assert_eq!(client.allowance(&owner, &spender), 300_000_000);

    client.transfer_from(&spender, &owner, &to, &200_000_000i128);
    assert_eq!(client.balance(&owner), 800_000_000);
    assert_eq!(client.balance(&to), 200_000_000);
    assert_eq!(client.allowance(&owner, &spender), 100_000_000);
}

#[test]
fn test_burn() {
    let (_, client) = setup();
    let admin = Address::generate(&env);
    let from = Address::generate(&env);

    client.mint(&admin, &from, &1_000_000_000i128);
    client.burn(&admin, &from, &300_000_000i128);
    assert_eq!(client.balance(&from), 700_000_000);
}

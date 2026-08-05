#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, token::Client as TokenClient,
    Address, Env, Symbol,
};

mod storage;
#[cfg(test)]
mod test;

pub use crate::storage::{
    claimed_count, farmer_count, get_config, get_state, is_paused, last_reading_id, liability,
    set_state, total_liquidity, total_payouts, total_premiums, CoverageRecord, DataKey,
    PoolConfig, PoolState, Reading, METRIC_RAINFALL,
};

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum PoolError {
    AlreadyInitialized = 1,
    InvalidParameter = 2,
    InvalidWindow = 3,
    OraclesMustDiffer = 4,
    UnsupportedMetric = 5,
    Unauthorized = 6,
    UnauthorizedOracle = 7,
    Paused = 8,
    PoolNotActive = 9,
    PoolInsolvent = 10,
    AlreadyEnrolled = 11,
    NotEnrolled = 12,
    AlreadyClaimed = 13,
    NotTriggered = 14,
    ClaimWindowClosed = 15,
    EmptyPool = 16,
    AmountInvalid = 17,
    InsufficientBalance = 18,
    BreaksSolvency = 19,
    FutureReading = 20,
    OutsideWindow = 21,
    InvalidReading = 22,
    AlreadySubmitted = 23,
    TimestampMismatch = 24,
    OraclesDisagree = 25,
    PoolStillActive = 26,
    AlreadyClosed = 27,
    PoolNotClosed = 28,
}

#[contract]
pub struct InsurancePool;

#[contractimpl]
impl InsurancePool {
    pub fn initialize(env: Env, admin: Address, config: PoolConfig) {
        if env.storage().instance().has(&DataKey::Config) {
            panic_with_error!(env, PoolError::AlreadyInitialized);
        }
        admin.require_auth();

        if config.oracle_a == config.oracle_b {
            panic_with_error!(env, PoolError::OraclesMustDiffer);
        }
        if config.premium <= 0
            || config.coverage <= 0
            || config.threshold <= 0
            || config.min_liquidity <= 0
        {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        if config.window_end <= config.window_start {
            panic_with_error!(env, PoolError::InvalidWindow);
        }
        if config.metric != METRIC_RAINFALL {
            panic_with_error!(env, PoolError::UnsupportedMetric);
        }

        let mut cfg = config.clone();
        cfg.admin = admin.clone();

        env.storage().instance().set(&DataKey::Config, &cfg);
        env.storage()
            .persistent()
            .set(&DataKey::State, &PoolState::Active.to_u32());
        env.storage().persistent().set(&DataKey::Paused, &false);
        env.storage()
            .persistent()
            .set(&DataKey::TotalLiquidity, &0i128);
        env.storage()
            .persistent()
            .set(&DataKey::TotalPremiums, &0i128);
        env.storage()
            .persistent()
            .set(&DataKey::TotalPayouts, &0i128);
        env.storage().persistent().set(&DataKey::FarmerCount, &0u32);
        env.storage().persistent().set(&DataKey::ClaimedCount, &0u32);
        env.storage()
            .persistent()
            .set(&DataKey::LastReadingId, &0u64);

        env.events().publish(
            (symbol_short!("created"),),
            (
                cfg.region,
                cfg.premium,
                cfg.coverage,
                cfg.threshold,
            ),
        );
    }

    pub fn set_oracles(env: Env, oracle_a: Address, oracle_b: Address) {
        let config = get_config(&env);
        config.admin.require_auth();
        if get_state(&env) != PoolState::Active {
            panic_with_error!(env, PoolError::PoolNotActive);
        }
        if oracle_a == oracle_b {
            panic_with_error!(env, PoolError::OraclesMustDiffer);
        }
        let mut updated = config;
        updated.oracle_a = oracle_a.clone();
        updated.oracle_b = oracle_b.clone();
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("oracles"),), (oracle_a, oracle_b));
    }

    pub fn pause(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        env.storage().persistent().set(&DataKey::Paused, &true);
        env.events().publish((symbol_short!("paused"),), ());
    }

    pub fn unpause(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        env.storage().persistent().set(&DataKey::Paused, &false);
        env.events().publish((symbol_short!("unpaused"),), ());
    }

    pub fn close_pool(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        let state = get_state(&env);
        if state == PoolState::Active {
            panic_with_error!(env, PoolError::PoolStillActive);
        }
        if state == PoolState::Closed {
            panic_with_error!(env, PoolError::AlreadyClosed);
        }
        set_state(&env, PoolState::Closed);
        env.events().publish((symbol_short!("closed"),), ());
    }

    pub fn admin_withdraw(env: Env, amount: i128) {
        let config = get_config(&env);
        config.admin.require_auth();
        if get_state(&env) != PoolState::Closed {
            panic_with_error!(env, PoolError::PoolNotClosed);
        }
        if amount <= 0 {
            panic_with_error!(env, PoolError::AmountInvalid);
        }
        let token = TokenClient::new(&env, &config.token);
        if amount > token.balance(&env.current_contract_address()) {
            panic_with_error!(env, PoolError::InsufficientBalance);
        }
        token.transfer(&env.current_contract_address(), &config.admin, &amount);
        env.events()
            .publish((symbol_short!("withdraw"),), (config.admin, amount));
    }

    pub fn enroll(env: Env, farmer: Address) {
        farmer.require_auth();
        let config = get_config(&env);
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Active {
            panic_with_error!(env, PoolError::PoolNotActive);
        }
        if env
            .storage()
            .persistent()
            .has(&DataKey::Farmer(farmer.clone()))
        {
            panic_with_error!(env, PoolError::AlreadyEnrolled);
        }

        let next_liability = (farmer_count(&env) as i128 + 1) * config.coverage;
        let token = TokenClient::new(&env, &config.token);
        if token.balance(&env.current_contract_address()) < next_liability {
            panic_with_error!(env, PoolError::PoolInsolvent);
        }

        token.transfer(&farmer, &env.current_contract_address(), &config.premium);

        let record = CoverageRecord {
            enrolled_at: env.ledger().timestamp(),
            premium_paid: config.premium,
            claimed: false,
            payout_amount: 0,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Farmer(farmer.clone()), &record);
        env.storage()
            .persistent()
            .set(&DataKey::FarmerCount, &(farmer_count(&env) + 1));
        env.storage().persistent().set(
            &DataKey::TotalPremiums,
            &(total_premiums(&env) + config.premium),
        );

        env.events()
            .publish((symbol_short!("enrolled"),), (farmer, config.premium));
    }

    pub fn claim_payout(env: Env, farmer: Address) {
        farmer.require_auth();
        let config = get_config(&env);
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Triggered {
            panic_with_error!(env, PoolError::NotTriggered);
        }
        let now = env.ledger().timestamp();
        if now > config.window_end.saturating_add(config.payout_window) {
            panic_with_error!(env, PoolError::ClaimWindowClosed);
        }

        let mut record: CoverageRecord = match env
            .storage()
            .persistent()
            .get(&DataKey::Farmer(farmer.clone()))
        {
            Some(r) => r,
            None => panic_with_error!(env, PoolError::NotEnrolled),
        };
        if record.claimed {
            panic_with_error!(env, PoolError::AlreadyClaimed);
        }

        let token = TokenClient::new(&env, &config.token);
        let balance = token.balance(&env.current_contract_address());
        let outstanding = liability(&env);
        let payout = if balance >= outstanding {
            config.coverage
        } else {
            (balance * config.coverage) / outstanding
        };
        if payout <= 0 {
            panic_with_error!(env, PoolError::EmptyPool);
        }

        token.transfer(&env.current_contract_address(), &farmer, &payout);

        record.claimed = true;
        record.payout_amount = payout;
        env.storage()
            .persistent()
            .set(&DataKey::Farmer(farmer.clone()), &record);
        env.storage()
            .persistent()
            .set(&DataKey::TotalPayouts, &(total_payouts(&env) + payout));

        let new_claimed = claimed_count(&env) + 1;
        env.storage()
            .persistent()
            .set(&DataKey::ClaimedCount, &new_claimed);
        if new_claimed >= farmer_count(&env) {
            set_state(&env, PoolState::PaidOut);
        }

        env.events()
            .publish((symbol_short!("claimed"),), (farmer, payout));
    }

    pub fn deposit_liquidity(env: Env, provider: Address, amount: i128) {
        provider.require_auth();
        let config = get_config(&env);
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Active {
            panic_with_error!(env, PoolError::PoolNotActive);
        }
        if amount <= 0 {
            panic_with_error!(env, PoolError::AmountInvalid);
        }

        let token = TokenClient::new(&env, &config.token);
        token.transfer(&provider, &env.current_contract_address(), &amount);

        let current = env
            .storage()
            .persistent()
            .get::<DataKey, i128>(&DataKey::Provider(provider.clone()))
            .unwrap_or(0);
        env.storage().persistent().set(
            &DataKey::Provider(provider.clone()),
            &(current + amount),
        );
        env.storage().persistent().set(
            &DataKey::TotalLiquidity,
            &(total_liquidity(&env) + amount),
        );

        env.events()
            .publish((symbol_short!("deposit"),), (provider, amount));
    }

    pub fn withdraw_liquidity(env: Env, provider: Address, amount: i128) {
        provider.require_auth();
        let config = get_config(&env);
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Active {
            panic_with_error!(env, PoolError::PoolNotActive);
        }
        if amount <= 0 {
            panic_with_error!(env, PoolError::AmountInvalid);
        }

        let current = env
            .storage()
            .persistent()
            .get::<DataKey, i128>(&DataKey::Provider(provider.clone()))
            .unwrap_or(0);
        if amount > current {
            panic_with_error!(env, PoolError::InsufficientBalance);
        }

        let token = TokenClient::new(&env, &config.token);
        let remaining = token
            .balance(&env.current_contract_address())
            .saturating_sub(amount);
        if remaining < liability(&env) {
            panic_with_error!(env, PoolError::BreaksSolvency);
        }

        token.transfer(&env.current_contract_address(), &provider, &amount);
        env.storage()
            .persistent()
            .set(&DataKey::Provider(provider.clone()), &(current - amount));
        env.storage().persistent().set(
            &DataKey::TotalLiquidity,
            &(total_liquidity(&env) - amount),
        );

        env.events()
            .publish((symbol_short!("withdrawn"),), (provider, amount));
    }

    pub fn submit_reading(
        env: Env,
        oracle: Address,
        reading_id: u64,
        timestamp: u64,
        value: i128,
    ) {
        let config = get_config(&env);
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Active {
            panic_with_error!(env, PoolError::PoolNotActive);
        }

        let is_oracle_a = oracle == config.oracle_a;
        let is_oracle_b = oracle == config.oracle_b;
        if !is_oracle_a && !is_oracle_b {
            panic_with_error!(env, PoolError::UnauthorizedOracle);
        }
        oracle.require_auth();

        let now = env.ledger().timestamp();
        if timestamp > now {
            panic_with_error!(env, PoolError::FutureReading);
        }
        if timestamp < config.window_start || timestamp > config.window_end {
            panic_with_error!(env, PoolError::OutsideWindow);
        }
        if value < 0 {
            panic_with_error!(env, PoolError::InvalidReading);
        }

        let mut reading: Reading = env
            .storage()
            .persistent()
            .get(&DataKey::Reading(reading_id))
            .unwrap_or(Reading {
                timestamp,
                oracle_a: None,
                oracle_b: None,
                agreed: false,
                breach: false,
            });
        if reading.timestamp != timestamp {
            panic_with_error!(env, PoolError::TimestampMismatch);
        }

        if is_oracle_a {
            if reading.oracle_a.is_some() {
                panic_with_error!(env, PoolError::AlreadySubmitted);
            }
            reading.oracle_a = Some(value);
        } else {
            if reading.oracle_b.is_some() {
                panic_with_error!(env, PoolError::AlreadySubmitted);
            }
            reading.oracle_b = Some(value);
        }

        if let (Some(a), Some(b)) = (reading.oracle_a, reading.oracle_b) {
            let diff = if a > b { a - b } else { b - a };
            if diff > config.tolerance {
                panic_with_error!(env, PoolError::OraclesDisagree);
            }
            reading.agreed = true;
            reading.breach = a <= config.threshold;
            env.storage()
                .persistent()
                .set(&DataKey::Reading(reading_id), &reading);

            if reading_id > last_reading_id(&env) {
                env.storage()
                    .persistent()
                    .set(&DataKey::LastReadingId, &reading_id);
            }

            env.events().publish(
                (symbol_short!("reading"),),
                (reading_id, reading.timestamp, a, b, reading.breach),
            );

            if reading.breach {
                set_state(&env, PoolState::Triggered);
                env.events().publish(
                    (symbol_short!("triggered"),),
                    (reading_id, reading.timestamp, a, b),
                );
            }
        } else {
            env.storage()
                .persistent()
                .set(&DataKey::Reading(reading_id), &reading);
            env.events().publish(
                (symbol_short!("partial"),),
                (reading_id, reading.timestamp, value),
            );
        }
    }

    pub fn config(env: Env) -> PoolConfig {
        get_config(&env)
    }

    pub fn state(env: Env) -> u32 {
        get_state(&env).to_u32()
    }

    pub fn paused(env: Env) -> bool {
        is_paused(&env)
    }

    pub fn farmer_count(env: Env) -> u32 {
        farmer_count(&env)
    }

    pub fn claimed_count(env: Env) -> u32 {
        claimed_count(&env)
    }

    pub fn farmer_status(env: Env, farmer: Address) -> Option<CoverageRecord> {
        env.storage().persistent().get(&DataKey::Farmer(farmer))
    }

    pub fn provider_balance(env: Env, provider: Address) -> i128 {
        env.storage()
            .persistent()
            .get::<DataKey, i128>(&DataKey::Provider(provider))
            .unwrap_or(0)
    }

    pub fn total_liquidity(env: Env) -> i128 {
        total_liquidity(&env)
    }

    pub fn total_premiums(env: Env) -> i128 {
        total_premiums(&env)
    }

    pub fn total_payouts(env: Env) -> i128 {
        total_payouts(&env)
    }

    pub fn last_reading_id(env: Env) -> u64 {
        last_reading_id(&env)
    }

    pub fn get_reading(env: Env, reading_id: u64) -> Option<Reading> {
        env.storage()
            .persistent()
            .get(&DataKey::Reading(reading_id))
    }

    pub fn pool_balance(env: Env) -> i128 {
        let config = get_config(&env);
        let token = TokenClient::new(&env, &config.token);
        token.balance(&env.current_contract_address())
    }

    pub fn liability(env: Env) -> i128 {
        liability(&env)
    }

    pub fn solvency_ratio(env: Env) -> i128 {
        let outstanding = liability(&env);
        if outstanding <= 0 {
            return 10_000;
        }
        let config = get_config(&env);
        let token = TokenClient::new(&env, &config.token);
        let held = token.balance(&env.current_contract_address());
        held * 10_000 / outstanding
    }
}

use soroban_sdk::panic_with_error;

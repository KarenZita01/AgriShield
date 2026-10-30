#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, token::Client as TokenClient,
    Address, Env, Symbol,
};

mod storage;
#[cfg(test)]
mod test;

pub use crate::storage::{
    claimed_count, contract_version, farmer_count, farmer_enrolled_at, get_config, get_state,
    is_blacklisted, is_guarded, is_paused, last_deposit, last_oracle_submit, last_reading_id,
    liability, liquidity_lock_period, max_farmers, min_enrollment_period, net_liability,
    set_guard, set_state, set_triggered_at, total_claimed, total_liquidity, total_payouts,
    total_premiums, triggered_at, CoverageRecord, DataKey, PoolConfig, PoolState, Reading,
    METRIC_RAINFALL,
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
    ReentrancyDetected = 29,
    ReadingIdReplayed = 30,
    ReadingTooStale = 31,
    OracleCooldown = 32,
    PoolAtCapacity = 33,
    TooSoonToClaim = 34,
    LiquidityLocked = 35,
    Blacklisted = 36,
    AdminOnly = 37,
    UnclaimedFarmers = 38,
    InsufficientPremium = 39,
    InvalidMetric = 40,
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
        env.storage()
            .instance()
            .set(&DataKey::ContractVersion, &1u32);

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
        if state == PoolState::Triggered && claimed_count(&env) < farmer_count(&env) {
            panic_with_error!(env, PoolError::UnclaimedFarmers);
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
        let remaining = token
            .balance(&env.current_contract_address())
            .saturating_sub(amount);
        if remaining < net_liability(&env) {
            panic_with_error!(env, PoolError::BreaksSolvency);
        }
        token.transfer(&env.current_contract_address(), &config.admin, &amount);
        env.events()
            .publish((symbol_short!("withdraw"),), (config.admin, amount));
    }

    pub fn blacklist_address(env: Env, addr: Address) {
        let config = get_config(&env);
        config.admin.require_auth();
        env.storage().persistent().set(&DataKey::Blacklist(addr), &true);
        env.events()
            .publish((symbol_short!("blacklist"),), (addr,));
    }

    pub fn unblacklist_address(env: Env, addr: Address) {
        let config = get_config(&env);
        config.admin.require_auth();
        env.storage().persistent().remove(&DataKey::Blacklist(addr));
        env.events()
            .publish((symbol_short!("unblacklist"),), (addr,));
    }

    pub fn update_config(env: Env, config: PoolConfig) {
        let existing = get_config(&env);
        existing.admin.require_auth();
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
        env.storage().instance().set(&DataKey::Config, &config);
        env.events()
            .publish((symbol_short!("config_updated"),), (config.threshold, config.premium));
    }

    pub fn emergency_pause(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        env.storage().persistent().set(&DataKey::Paused, &true);
        env.events()
            .publish((symbol_short!("emergency_pause"),), (config.admin,));
    }

    pub fn emergency_unpause(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        env.storage().persistent().set(&DataKey::Paused, &false);
        env.events()
            .publish((symbol_short!("emergency_unpause"),), (config.admin,));
    }

    pub fn set_threshold(env: Env, threshold: i128) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if threshold <= 0 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.threshold = threshold;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("threshold_updated"),), (threshold,));
    }

    pub fn set_tolerance(env: Env, tolerance: i128) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if tolerance < 0 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.tolerance = tolerance;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("tolerance_updated"),), (tolerance,));
    }

    pub fn set_admin(env: Env, new_admin: Address) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if new_admin == existing.admin {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.admin = new_admin.clone();
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("admin_changed"),), (existing.admin, new_admin));
    }

    pub fn set_window(env: Env, window_start: u64, window_end: u64) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if window_end <= window_start {
            panic_with_error!(env, PoolError::InvalidWindow);
        }
        let mut updated = existing;
        updated.window_start = window_start;
        updated.window_end = window_end;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("window_updated"),), (window_start, window_end));
    }

    pub fn set_max_farmers(env: Env, max: u32) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if max == 0 || max < farmer_count(&env) {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        env.storage()
            .persistent()
            .set(&DataKey::MaxFarmers, &max);
        env.events()
            .publish((symbol_short!("max_farmers_updated"),), (max,));
    }

    pub fn set_premium(env: Env, premium: i128) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if premium <= 0 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.premium = premium;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("premium_updated"),), (premium,));
    }

    pub fn set_coverage(env: Env, coverage: i128) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if coverage <= 0 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.coverage = coverage;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("coverage_updated"),), (coverage,));
    }

    pub fn set_min_liquidity(env: Env, min_liquidity: i128) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if min_liquidity <= 0 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.min_liquidity = min_liquidity;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("min_liquidity_updated"),), (min_liquidity,));
    }

    pub fn set_payout_window(env: Env, payout_window: u64) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        let mut updated = existing;
        updated.payout_window = payout_window;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("payout_window_updated"),), (payout_window,));
    }

    pub fn set_region(env: Env, region: Symbol) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        let mut updated = existing;
        updated.region = region;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("region_updated"),), (region,));
    }

    pub fn set_metric(env: Env, metric: Symbol) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if metric != METRIC_RAINFALL {
            panic_with_error!(env, PoolError::UnsupportedMetric);
        }
        let mut updated = existing;
        updated.metric = metric;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("metric_updated"),), (metric,));
    }

    pub fn set_location(env: Env, latitude: i64, longitude: i64) {
        let existing = get_config(&env);
        existing.admin.require_auth();
        if latitude < -90_000_000 || latitude > 90_000_000 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        if longitude < -180_000_000 || longitude > 180_000_000 {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let mut updated = existing;
        updated.latitude = latitude;
        updated.longitude = longitude;
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("location_updated"),), (latitude, longitude));
    }

    pub fn activate_pool(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        let state = get_state(&env);
        if state == PoolState::Active {
            panic_with_error!(env, PoolError::PoolStillActive);
        }
        if state == PoolState::Closed {
            panic_with_error!(env, PoolError::AlreadyClosed);
        }
        set_state(&env, PoolState::Active);
        env.storage().persistent().set(&DataKey::Paused, &false);
        env.events()
            .publish((symbol_short!("activated"),), ());
    }

    pub fn revoke_oracle(env: Env, oracle: Address) {
        let config = get_config(&env);
        config.admin.require_auth();
        if oracle == config.oracle_a && oracle == config.oracle_b {
            panic_with_error!(env, PoolError::InvalidParameter);
        }
        let sentinel = env.current_contract_address();
        let mut updated = config;
        if updated.oracle_a == oracle {
            updated.oracle_a = sentinel.clone();
        }
        if updated.oracle_b == oracle {
            updated.oracle_b = sentinel;
        }
        env.storage().instance().set(&DataKey::Config, &updated);
        env.events()
            .publish((symbol_short!("oracle_revoked"),), (oracle,));
    }

    pub fn emergency_withdraw_all(env: Env) {
        let config = get_config(&env);
        config.admin.require_auth();
        if get_state(&env) != PoolState::Closed {
            panic_with_error!(env, PoolError::PoolNotClosed);
        }
        let token = TokenClient::new(&env, &config.token);
        let balance = token.balance(&env.current_contract_address());
        if balance <= 0 {
            panic_with_error!(env, PoolError::EmptyPool);
        }
        token.transfer(&env.current_contract_address(), &config.admin, &balance);
        env.events()
            .publish((symbol_short!("emergency_withdraw_all"),), (config.admin, balance));
    }

    pub fn get_last_reading_id(env: Env) -> u64 {
        crate::storage::last_reading_id(&env)
    }

    pub fn get_providers(env: Env) -> Vec<Address> {
        // Return providers with nonzero balances
        let mut result = Vec::new();
        // providers stored individually; scan not supported directly, return empty placeholder
        result
    }

    pub fn get_farmers(env: Env) -> Vec<Address> {
        let mut result = Vec::new();
        result
    }

    pub fn get_readings_count(env: Env) -> u64 {
        crate::storage::last_reading_id(&env)
    }

    pub fn health_check(env: Env) -> (u32, bool, i128) {
        (
            get_state(&env).to_u32(),
            is_paused(&env),
            net_liability(&env),
        )
    }

    pub fn enroll(env: Env, farmer: Address) {
        if is_guarded(&env) {
            panic_with_error!(env, PoolError::ReentrancyDetected);
        }
        set_guard(&env, true);
        let result = enroll_inner(&env, farmer);
        set_guard(&env, false);
        result;
    }

    fn enroll_inner(env: Env, farmer: Address) {
        farmer.require_auth();
        let config = get_config(&env);
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Active {
            panic_with_error!(env, PoolError::PoolNotActive);
        }
        if is_blacklisted(&env, &farmer) {
            panic_with_error!(env, PoolError::Blacklisted);
        }
        if farmer_count(&env) >= max_farmers(&env) {
            panic_with_error!(env, PoolError::PoolAtCapacity);
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
            .set(&DataKey::FarmerEnrolledAt(&farmer), &env.ledger().timestamp());
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
        if is_blacklisted(&env, &farmer) {
            panic_with_error!(env, PoolError::Blacklisted);
        }
        if is_paused(&env) {
            panic_with_error!(env, PoolError::Paused);
        }
        if get_state(&env) != PoolState::Triggered {
            panic_with_error!(env, PoolError::NotTriggered);
        }
        let now = env.ledger().timestamp();
        let triggered = triggered_at(&env);
        let claim_deadline = if triggered > 0 {
            triggered.saturating_add(config.payout_window)
        } else {
            config.window_end.saturating_add(config.payout_window)
        };
        if now > claim_deadline {
            panic_with_error!(env, PoolError::ClaimWindowClosed);
        }

        let enrolled_at = farmer_enrolled_at(&env, &farmer);
        let min_period = min_enrollment_period(&env);
        if min_period > 0 && enrolled_at > 0 && now.saturating_sub(enrolled_at) < min_period {
            panic_with_error!(env, PoolError::TooSoonToClaim);
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
        let outstanding = net_liability(&env);
        let payout = if balance >= outstanding {
            config.coverage
        } else if balance > 0 {
            let proportional = (balance * config.coverage) / outstanding
            if proportional == 0 {
                1i128
            } else {
                proportional
            }
        } else {
            0i128
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
        env.storage()
            .persistent()
            .set(&DataKey::TotalClaimed, &(total_claimed(&env) + payout));

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
        if is_blacklisted(&env, &provider) {
            panic_with_error!(env, PoolError::Blacklisted);
        }
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
        env.storage()
            .persistent()
            .set(&DataKey::LastDeposit(&provider), &env.ledger().timestamp());

        env.events()
            .publish((symbol_short!("deposit"),), (provider, amount));
    }

    pub fn withdraw_liquidity(env: Env, provider: Address, amount: i128) {
        provider.require_auth();
        let config = get_config(&env);
        if is_blacklisted(&env, &provider) {
            panic_with_error!(env, PoolError::Blacklisted);
        }
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

        let now = env.ledger().timestamp();
        let last_dep = last_deposit(&env, &provider);
        let lock = liquidity_lock_period(&env);
        if lock > 0 && last_dep > 0 && now.saturating_sub(last_dep) < lock {
            panic_with_error!(env, PoolError::LiquidityLocked);
        }

        let token = TokenClient::new(&env, &config.token);
        let remaining = token
            .balance(&env.current_contract_address())
            .saturating_sub(amount);
        if remaining < liability(&env) {
            panic_with_error!(env, PoolError::BreaksSolvency);
        }
        if total_liquidity(&env) - amount < config.min_liquidity {
            panic_with_error!(env, PoolError::PoolInsolvent);
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
        env.storage()
            .persistent()
            .set(&DataKey::LastOracleSubmit(&oracle), &env.ledger().timestamp());

        let now = env.ledger().timestamp();
        if timestamp > now {
            panic_with_error!(env, PoolError::FutureReading);
        }
        if timestamp < config.window_start || timestamp > config.window_end {
            panic_with_error!(env, PoolError::OutsideWindow);
        }
        if now.saturating_sub(timestamp) > 7 * 86_400 {
            panic_with_error!(env, PoolError::ReadingTooStale);
        }
        let last_submit = last_oracle_submit(&env, &oracle);
        if now.saturating_sub(last_submit) < 60 {
            panic_with_error!(env, PoolError::OracleCooldown);
        }
        if value < 0 {
            panic_with_error!(env, PoolError::InvalidReading);
        }
        if value > 1_000_000_000_000i128 {
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
        if reading.agreed {
            panic_with_error!(env, PoolError::ReadingIdReplayed);
        }
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
                set_triggered_at(&env, env.ledger().timestamp());
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

    pub fn is_active(env: Env) -> bool {
        get_state(&env) == PoolState::Active
    }

    pub fn is_pool_triggered(env: Env) -> bool {
        get_state(&env) == PoolState::Triggered
    }

    pub fn is_pool_closed(env: Env) -> bool {
        get_state(&env) == PoolState::Closed
    }

    pub fn is_pool_paused(env: Env) -> bool {
        is_paused(&env)
    }

    pub fn paused(env: Env) -> bool {

    pub fn farmer_status(env: Env, farmer: Address) -> Option<CoverageRecord> {
        env.storage().persistent().get(&DataKey::Farmer(farmer))
    }

    pub fn provider_balance(env: Env, provider: Address) -> i128 {
        env.storage()
            .persistent()
            .get::<DataKey, i128>(&DataKey::Provider(provider))
            .unwrap_or(0)
    }

    pub fn oracle_a(env: Env) -> Address {
        get_config(&env).oracle_a
    }

    pub fn oracle_b(env: Env) -> Address {
        get_config(&env).oracle_b
    }

    pub fn threshold(env: Env) -> i128 {
        get_config(&env).threshold
    }

    pub fn tolerance(env: Env) -> i128 {
        get_config(&env).tolerance
    }

    pub fn min_liquidity(env: Env) -> i128 {
        get_config(&env).min_liquidity
    }

    pub fn payout_window(env: Env) -> u64 {
        get_config(&env).payout_window
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
        crate::storage::liability(&env)
    }

    pub fn total_liquidity(env: Env) -> i128 {
        crate::storage::total_liquidity(&env)
    }

    pub fn total_premiums(env: Env) -> i128 {
        crate::storage::total_premiums(&env)
    }

    pub fn total_payouts(env: Env) -> i128 {
        crate::storage::total_payouts(&env)
    }

    pub fn total_claimed(env: Env) -> i128 {
        crate::storage::total_claimed(&env)
    }

    pub fn farmer_count(env: Env) -> u32 {
        crate::storage::farmer_count(&env)
    }

    pub fn claimed_count(env: Env) -> u32 {
        crate::storage::claimed_count(&env)
    }

    pub fn net_liability(env: Env) -> i128 {
        crate::storage::net_liability(&env)
    }

    pub fn premium(env: Env) -> i128 {
        get_config(&env).premium
    }

    pub fn coverage(env: Env) -> i128 {
        get_config(&env).coverage
    }

    pub fn enrollment_fee(env: Env) -> i128 {
        get_config(&env).premium
    }

    pub fn total_farmers(env: Env) -> u32 {
        crate::storage::farmer_count(&env)
    }

    pub fn solvency_percent(env: Env) -> u32 {
        let outstanding = liability(&env);
        if outstanding <= 0 {
            return 10_000;
        }
        let config = get_config(&env);
        let token = TokenClient::new(&env, &config.token);
        let held = token.balance(&env.current_contract_address());
        (held * 10_000 / outstanding) as u32
    }

    pub fn is_oracle_authorized(env: Env, addr: Address) -> bool {
        let c = get_config(&env);
        addr == c.oracle_a || addr == c.oracle_b
    }

    pub fn config_admin(env: Env) -> Address {
        get_config(&env).admin
    }

    pub fn token_address(env: Env) -> Address {
        get_config(&env).token
    }

    pub fn region(env: Env) -> Symbol {
        get_config(&env).region
    }

    pub fn min_enrollment_period_read(env: Env) -> u64 {
        crate::storage::min_enrollment_period(&env)
    }

    pub fn liquidity_lock_period_read(env: Env) -> u64 {
        crate::storage::liquidity_lock_period(&env)
    }

    pub fn is_blacklisted_read(env: Env, addr: Address) -> bool {
        crate::storage::is_blacklisted(&env, &addr)
    }

    pub fn is_guarded_read(env: Env) -> bool {
        crate::storage::is_guarded(&env)
    }

    pub fn last_oracle_submit_read(env: Env, addr: Address) -> u64 {
        crate::storage::last_oracle_submit(&env, &addr)
    }

    pub fn last_deposit_read(env: Env, addr: Address) -> u64 {
        crate::storage::last_deposit(&env, &addr)
    }

    pub fn contract_version_read(env: Env) -> u32 {
        crate::storage::contract_version(&env)
    }

    pub fn window_start_read(env: Env) -> u64 {
        get_config(&env).window_start
    }

    pub fn window_end_read(env: Env) -> u64 {
        get_config(&env).window_end
    }

    pub fn max_farmers_read(env: Env) -> u32 {
        crate::storage::max_farmers(&env)
    }

    pub fn config_read(env: Env) -> (Address, Address, Address, Address, Symbol, i64, i64, u32, i128, i128, i128, u64, u64, i128, u64, i128) {
        let c = get_config(&env);
        (c.admin, c.oracle_a, c.oracle_b, c.token, c.region, c.latitude, c.longitude, c.metric, c.threshold, c.premium, c.coverage, c.window_start, c.window_end, c.min_liquidity, c.payout_window, c.tolerance)
    }

    pub fn triggered_at(env: Env) -> u64 {
        crate::storage::triggered_at(&env)
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

    pub fn summary(env: Env) -> (u32, bool, u32, u32, i128, i128, i128, i128, u64, i128) {
        let config = get_config(&env);
        let token = TokenClient::new(&env, &config.token);
        let held = token.balance(&env.current_contract_address());
        (
            get_state(&env).to_u32(),
            is_paused(&env),
            farmer_count(&env),
            claimed_count(&env),
            total_liquidity(&env),
            total_payouts(&env),
            net_liability(&env),
            held,
            last_reading_id(&env),
            held * 10_000 / crate::storage::liability(&env).max(1),
        )
    }
}

use soroban_sdk::panic_with_error;

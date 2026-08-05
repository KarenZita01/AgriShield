use soroban_sdk::{contracttype, Address, Env, Symbol};

pub const METRIC_RAINFALL: u32 = 0;

#[derive(Clone)]
#[contracttype]
pub struct PoolConfig {
    pub admin: Address,
    pub oracle_a: Address,
    pub oracle_b: Address,
    pub token: Address,
    pub region: Symbol,
    pub latitude: i64,
    pub longitude: i64,
    pub metric: u32,
    pub threshold: i128,
    pub premium: i128,
    pub coverage: i128,
    pub window_start: u64,
    pub window_end: u64,
    pub min_liquidity: i128,
    pub payout_window: u64,
    pub tolerance: i128,
}

#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
pub enum PoolState {
    Active = 0,
    Triggered = 1,
    PaidOut = 2,
    Closed = 3,
}

impl PoolState {
    pub fn to_u32(self) -> u32 {
        self as u32
    }
    pub fn from_u32(v: u32) -> Self {
        match v {
            0 => Self::Active,
            1 => Self::Triggered,
            2 => Self::PaidOut,
            _ => Self::Closed,
        }
    }
}

#[derive(Clone)]
#[contracttype]
pub struct CoverageRecord {
    pub enrolled_at: u64,
    pub premium_paid: i128,
    pub claimed: bool,
    pub payout_amount: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct Reading {
    pub timestamp: u64,
    pub oracle_a: Option<i128>,
    pub oracle_b: Option<i128>,
    pub agreed: bool,
    pub breach: bool,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Config,
    State,
    Paused,
    TotalLiquidity,
    TotalPremiums,
    TotalPayouts,
    FarmerCount,
    ClaimedCount,
    LastReadingId,
    Farmer(Address),
    Provider(Address),
    Reading(u64),
}

pub fn get_config(env: &Env) -> PoolConfig {
    env.storage().instance().get(&DataKey::Config).unwrap()
}

pub fn get_state(env: &Env) -> PoolState {
    let v: u32 = env
        .storage()
        .persistent()
        .get(&DataKey::State)
        .unwrap_or(0);
    PoolState::from_u32(v)
}

pub fn set_state(env: &Env, state: PoolState) {
    env.storage()
        .persistent()
        .set(&DataKey::State, &state.to_u32());
}

pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .persistent()
        .get(&DataKey::Paused)
        .unwrap_or(false)
}

pub fn total_liquidity(env: &Env) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::TotalLiquidity)
        .unwrap_or(0)
}

pub fn total_premiums(env: &Env) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::TotalPremiums)
        .unwrap_or(0)
}

pub fn total_payouts(env: &Env) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::TotalPayouts)
        .unwrap_or(0)
}

pub fn farmer_count(env: &Env) -> u32 {
    env.storage()
        .persistent()
        .get(&DataKey::FarmerCount)
        .unwrap_or(0)
}

pub fn claimed_count(env: &Env) -> u32 {
    env.storage()
        .persistent()
        .get(&DataKey::ClaimedCount)
        .unwrap_or(0)
}

pub fn last_reading_id(env: &Env) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::LastReadingId)
        .unwrap_or(0)
}

pub fn liability(env: &Env) -> i128 {
    farmer_count(env) as i128 * get_config(env).coverage
}

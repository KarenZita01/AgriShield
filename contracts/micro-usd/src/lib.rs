#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum TokenError {
    AlreadyInitialized = 1,
    NegativeAmount = 2,
    InsufficientBalance = 3,
    InsufficientAllowance = 4,
    Unauthorized = 5,
}

#[derive(Clone)]
#[contracttype]
pub enum StorageKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    Balance(Address),
    Allowance(Address, Address),
}

#[contract]
pub struct MicroUSD;

#[contractimpl]
impl MicroUSD {
    pub fn initialize(
        env: Env,
        admin: Address,
        name: soroban_sdk::Symbol,
        symbol: soroban_sdk::Symbol,
        decimals: u32,
    ) {
        if env.storage().instance().has(&StorageKey::Admin) {
            panic_with_error!(env, TokenError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::Name, &name);
        env.storage()
            .instance()
            .set(&StorageKey::Symbol, &symbol);
        env.storage()
            .instance()
            .set(&StorageKey::Decimals, &decimals);
    }

    pub fn name(env: Env) -> soroban_sdk::Symbol {
        env.storage().instance().get(&StorageKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> soroban_sdk::Symbol {
        env.storage().instance().get(&StorageKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&StorageKey::Decimals)
            .unwrap_or(7)
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage()
            .persistent()
            .get::<StorageKey, i128>(&StorageKey::Balance(account))
            .unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        if amount < 0 {
            panic_with_error!(env, TokenError::NegativeAmount);
        }
        from.require_auth();
        let from_bal = Self::balance(env.clone(), from.clone());
        if amount > from_bal {
            panic_with_error!(env, TokenError::InsufficientBalance);
        }
        env.storage()
            .persistent()
            .set(&StorageKey::Balance(from.clone()), &(from_bal - amount));
        let to_bal = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&StorageKey::Balance(to), &(to_bal + amount));
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage()
            .persistent()
            .get::<StorageKey, i128>(&StorageKey::Allowance(owner, spender))
            .unwrap_or(0)
    }

    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        if amount < 0 {
            panic_with_error!(env, TokenError::NegativeAmount);
        }
        env.storage()
            .persistent()
            .set(&StorageKey::Allowance(owner, spender), &amount);
    }

    pub fn transfer_from(
        env: Env,
        spender: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        if amount < 0 {
            panic_with_error!(env, TokenError::NegativeAmount);
        }
        spender.require_auth();
        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if amount > allowance {
            panic_with_error!(env, TokenError::InsufficientAllowance);
        }
        let from_bal = Self::balance(env.clone(), from.clone());
        if amount > from_bal {
            panic_with_error!(env, TokenError::InsufficientBalance);
        }
        env.storage().persistent().set(
            &StorageKey::Allowance(from.clone(), spender),
            &(allowance - amount),
        );
        env.storage()
            .persistent()
            .set(&StorageKey::Balance(from), &(from_bal - amount));
        let to_bal = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&StorageKey::Balance(to), &(to_bal + amount));
    }

    pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
        let stored_admin: Address = env.storage().instance().get(&StorageKey::Admin).unwrap();
        if admin != stored_admin {
            panic_with_error!(env, TokenError::Unauthorized);
        }
        admin.require_auth();
        if amount < 0 {
            panic_with_error!(env, TokenError::NegativeAmount);
        }
        let bal = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&StorageKey::Balance(to), &(bal + amount));
    }

    pub fn burn(env: Env, admin: Address, from: Address, amount: i128) {
        let stored_admin: Address = env.storage().instance().get(&StorageKey::Admin).unwrap();
        if admin != stored_admin {
            panic_with_error!(env, TokenError::Unauthorized);
        }
        admin.require_auth();
        if amount < 0 {
            panic_with_error!(env, TokenError::NegativeAmount);
        }
        let bal = Self::balance(env.clone(), from.clone());
        if amount > bal {
            panic_with_error!(env, TokenError::InsufficientBalance);
        }
        env.storage()
            .persistent()
            .set(&StorageKey::Balance(from), &(bal - amount));
    }
}

use soroban_sdk::panic_with_error;

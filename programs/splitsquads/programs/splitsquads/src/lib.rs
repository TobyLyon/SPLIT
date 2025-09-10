use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod splitsquads {
    use super::*;

    pub fn initialize_squad(
        ctx: Context<InitializeSquad>,
        name: String,
        max_members: u8,
    ) -> Result<()> {
        require!(max_members >= 2 && max_members <= 8, ErrorCode::InvalidSquadSize);
        require!(name.len() <= 32, ErrorCode::NameTooLong);

        let squad = &mut ctx.accounts.squad;
        squad.authority = ctx.accounts.authority.key();
        squad.name = name;
        squad.max_members = max_members;
        squad.member_count = 0;
        squad.total_staked = 0;
        squad.rewards_vault = ctx.accounts.rewards_vault.key();
        squad.bump = ctx.bumps.squad;

        Ok(())
    }

    pub fn join_squad(ctx: Context<JoinSquad>) -> Result<()> {
        let squad = &mut ctx.accounts.squad;
        require!(squad.member_count < squad.max_members, ErrorCode::SquadFull);

        let member = &mut ctx.accounts.member;
        member.squad = squad.key();
        member.authority = ctx.accounts.authority.key();
        member.stake_amount = 0;
        member.join_timestamp = Clock::get()?.unix_timestamp;
        member.last_activity_timestamp = Clock::get()?.unix_timestamp;
        member.activity_score = 0;
        member.bump = ctx.bumps.member;

        squad.member_count += 1;

        Ok(())
    }

    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let member = &mut ctx.accounts.member;
        let squad = &mut ctx.accounts.squad;

        // Transfer tokens from member to squad vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.member_token_account.to_account_info(),
                to: ctx.accounts.squad_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update member stake
        member.stake_amount = member.stake_amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        squad.total_staked = squad.total_staked.checked_add(amount).ok_or(ErrorCode::Overflow)?;

        Ok(())
    }

    pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let member = &mut ctx.accounts.member;
        let squad = &mut ctx.accounts.squad;

        require!(member.stake_amount >= amount, ErrorCode::InsufficientStake);

        // Transfer tokens from squad vault to member
        let seeds = &[
            b"squad",
            squad.authority.as_ref(),
            squad.name.as_bytes(),
            &[squad.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.squad_vault.to_account_info(),
                to: ctx.accounts.member_token_account.to_account_info(),
                authority: ctx.accounts.squad.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, amount)?;

        // Update member stake
        member.stake_amount = member.stake_amount.checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        squad.total_staked = squad.total_staked.checked_sub(amount).ok_or(ErrorCode::Underflow)?;

        Ok(())
    }

    pub fn update_activity_score(
        ctx: Context<UpdateActivityScore>,
        member_pubkey: Pubkey,
        new_score: u32,
    ) -> Result<()> {
        // Only oracle can update activity scores
        require!(
            ctx.accounts.oracle.key() == ctx.accounts.authority.key(),
            ErrorCode::UnauthorizedOracle
        );

        let member = &mut ctx.accounts.member;
        member.activity_score = new_score;
        member.last_activity_timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
        let squad = &ctx.accounts.squad;
        let rewards_vault = &ctx.accounts.rewards_vault;

        require!(squad.member_count > 0, ErrorCode::NoMembers);
        require!(rewards_vault.amount > 0, ErrorCode::NoRewards);

        // Calculate total weight for all members
        let mut total_weight = 0u128;
        let current_time = Clock::get()?.unix_timestamp;

        // First pass: calculate total weight
        for member_info in ctx.remaining_accounts.iter() {
            let member_data = member_info.try_borrow_data()?;
            let member = Member::try_deserialize(&mut &member_data[8..])?;
            
            let weight = calculate_member_weight(
                member.stake_amount,
                current_time - member.join_timestamp,
                squad.member_count,
                member.activity_score,
            )?;
            total_weight = total_weight.checked_add(weight as u128).ok_or(ErrorCode::Overflow)?;
        }

        require!(total_weight > 0, ErrorCode::ZeroTotalWeight);

        // Second pass: distribute rewards proportionally
        let total_rewards = rewards_vault.amount;
        
        for (i, member_info) in ctx.remaining_accounts.iter().enumerate() {
            if i % 2 == 1 {
                continue; // Skip token accounts, only process member accounts
            }
            
            let member_data = member_info.try_borrow_data()?;
            let member = Member::try_deserialize(&mut &member_data[8..])?;
            
            let weight = calculate_member_weight(
                member.stake_amount,
                current_time - member.join_timestamp,
                squad.member_count,
                member.activity_score,
            )?;

            let reward_amount = ((weight as u128)
                .checked_mul(total_rewards as u128)
                .ok_or(ErrorCode::Overflow)?)
                .checked_div(total_weight)
                .ok_or(ErrorCode::DivisionByZero)? as u64;

            if reward_amount > 0 && i + 1 < ctx.remaining_accounts.len() {
                let member_token_account = &ctx.remaining_accounts[i + 1];
                
                // Transfer reward to member
                let seeds = &[
                    b"squad",
                    squad.authority.as_ref(),
                    squad.name.as_bytes(),
                    &[squad.bump],
                ];
                let signer_seeds = &[&seeds[..]];

                let transfer_ctx = CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: rewards_vault.to_account_info(),
                        to: member_token_account.to_account_info(),
                        authority: squad.to_account_info(),
                    },
                    signer_seeds,
                );
                token::transfer(transfer_ctx, reward_amount)?;
            }
        }

        Ok(())
    }
}

fn calculate_member_weight(
    stake_amount: u64,
    tenure_seconds: i64,
    squad_size: u8,
    activity_score: u32,
) -> Result<u64> {
    // Base stake weight (normalized to avoid overflow)
    let base_weight = stake_amount / 1_000_000; // Divide by 1M to normalize

    // Tenure multiplier (max 2x after 90 days)
    let max_tenure_seconds = 90 * 24 * 60 * 60; // 90 days
    let tenure_multiplier = if tenure_seconds >= max_tenure_seconds {
        200 // 2.0x
    } else {
        100 + ((tenure_seconds * 100) / max_tenure_seconds) as u32 // 1.0x to 2.0x
    };

    // Squad size multiplier (larger squads get small bonus, max 1.2x for 8 members)
    let squad_multiplier = 100 + ((squad_size as u32 - 2) * 4); // 1.0x to 1.2x

    // Activity multiplier (score 0-100 maps to 0.5x to 1.5x)
    let activity_multiplier = 50 + activity_score.min(100); // 0.5x to 1.5x

    // Calculate final weight with safe math
    let weight = (base_weight as u128)
        .checked_mul(tenure_multiplier as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_mul(squad_multiplier as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_mul(activity_multiplier as u128)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(100_000_000) // Normalize back
        .ok_or(ErrorCode::DivisionByZero)?;

    Ok(weight.min(u64::MAX as u128) as u64)
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeSquad<'info> {
    #[account(
        init,
        payer = authority,
        space = Squad::LEN,
        seeds = [b"squad", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub squad: Account<'info, Squad>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = squad,
        seeds = [b"rewards_vault", squad.key().as_ref()],
        bump
    )]
    pub rewards_vault: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct JoinSquad<'info> {
    #[account(mut)]
    pub squad: Account<'info, Squad>,
    
    #[account(
        init,
        payer = authority,
        space = Member::LEN,
        seeds = [b"member", squad.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub squad: Account<'info, Squad>,
    
    #[account(
        mut,
        seeds = [b"member", squad.key().as_ref(), authority.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = squad,
        seeds = [b"squad_vault", squad.key().as_ref()],
        bump
    )]
    pub squad_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = authority
    )]
    pub member_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut)]
    pub squad: Account<'info, Squad>,
    
    #[account(
        mut,
        seeds = [b"member", squad.key().as_ref(), authority.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = squad,
        seeds = [b"squad_vault", squad.key().as_ref()],
        bump
    )]
    pub squad_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = authority
    )]
    pub member_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateActivityScore<'info> {
    #[account(
        mut,
        seeds = [b"member", squad.key().as_ref(), member.authority.as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    
    pub squad: Account<'info, Squad>,
    
    /// CHECK: Oracle authority - validated in instruction
    pub oracle: UncheckedAccount<'info>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    pub squad: Account<'info, Squad>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = squad,
        seeds = [b"rewards_vault", squad.key().as_ref()],
        bump
    )]
    pub rewards_vault: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Squad {
    pub authority: Pubkey,
    pub name: String,
    pub max_members: u8,
    pub member_count: u8,
    pub total_staked: u64,
    pub rewards_vault: Pubkey,
    pub bump: u8,
}

impl Squad {
    pub const LEN: usize = 8 + 32 + 4 + 32 + 1 + 1 + 8 + 32 + 1;
}

#[account]
pub struct Member {
    pub squad: Pubkey,
    pub authority: Pubkey,
    pub stake_amount: u64,
    pub join_timestamp: i64,
    pub last_activity_timestamp: i64,
    pub activity_score: u32,
    pub bump: u8,
}

impl Member {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 4 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Squad size must be between 2 and 8 members")]
    InvalidSquadSize,
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Squad is full")]
    SquadFull,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    #[msg("No members in squad")]
    NoMembers,
    #[msg("No rewards to distribute")]
    NoRewards,
    #[msg("Zero total weight")]
    ZeroTotalWeight,
    #[msg("Math overflow")]
    Overflow,
    #[msg("Math underflow")]
    Underflow,
    #[msg("Division by zero")]
    DivisionByZero,
}
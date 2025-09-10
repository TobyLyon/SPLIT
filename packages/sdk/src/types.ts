import { PublicKey, BN } from '@solana/web3.js';

export interface SquadData {
  authority: PublicKey;
  name: string;
  maxMembers: number;
  memberCount: number;
  totalStaked: BN;
  rewardsVault: PublicKey;
  bump: number;
}

export interface Squad {
  pubkey: PublicKey;
  data: SquadData;
}

export interface MemberData {
  squad: PublicKey;
  authority: PublicKey;
  stakeAmount: BN;
  joinTimestamp: BN;
  lastActivityTimestamp: BN;
  activityScore: number;
  bump: number;
}

export interface Member {
  pubkey: PublicKey;
  data: MemberData;
}

export interface SquadConfig {
  name: string;
  maxMembers: number;
  mint: PublicKey;
}

export interface StakeConfig {
  squad: PublicKey;
  amount: BN;
  mint: PublicKey;
}

export interface DistributionConfig {
  squad: PublicKey;
  mint: PublicKey;
  members: Array<{
    member: PublicKey;
    tokenAccount: PublicKey;
  }>;
}

export interface WeightCalculation {
  baseWeight: BN;
  tenureMultiplier: number;
  squadMultiplier: number;
  activityMultiplier: number;
  finalWeight: BN;
}

// Error types
export enum SplitSquadsError {
  InvalidSquadSize = 6000,
  NameTooLong = 6001,
  SquadFull = 6002,
  InvalidAmount = 6003,
  InsufficientStake = 6004,
  UnauthorizedOracle = 6005,
  NoMembers = 6006,
  NoRewards = 6007,
  ZeroTotalWeight = 6008,
  Overflow = 6009,
  Underflow = 6010,
  DivisionByZero = 6011,
}

export const SPLIT_SQUADS_ERRORS: Record<number, string> = {
  [SplitSquadsError.InvalidSquadSize]: 'Squad size must be between 2 and 8 members',
  [SplitSquadsError.NameTooLong]: 'Name is too long',
  [SplitSquadsError.SquadFull]: 'Squad is full',
  [SplitSquadsError.InvalidAmount]: 'Invalid amount',
  [SplitSquadsError.InsufficientStake]: 'Insufficient stake',
  [SplitSquadsError.UnauthorizedOracle]: 'Unauthorized oracle',
  [SplitSquadsError.NoMembers]: 'No members in squad',
  [SplitSquadsError.NoRewards]: 'No rewards to distribute',
  [SplitSquadsError.ZeroTotalWeight]: 'Zero total weight',
  [SplitSquadsError.Overflow]: 'Math overflow',
  [SplitSquadsError.Underflow]: 'Math underflow',
  [SplitSquadsError.DivisionByZero]: 'Division by zero',
};
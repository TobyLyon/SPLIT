import { PublicKey } from '@solana/web3.js';

// Program Configuration
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);

// Token Configuration
export const SPLIT_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_SPLIT_TOKEN_MINT || 'So11111111111111111111111111111111111111112' // Wrapped SOL as default
);

// Network Configuration
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';

// Oracle Configuration
export const ORACLE_PUBLIC_KEY = new PublicKey(
  process.env.NEXT_PUBLIC_ORACLE_PUBLIC_KEY || 'oRACLEpUbLicKeY1111111111111111111111111111'
);

// App Configuration
export const APP_CONFIG = {
  name: 'SplitSquads',
  description: 'Rewards-sharing social staking on Solana',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://splitsquads.com',
  twitter: '@splitsquads',
  discord: 'https://discord.gg/splitsquads',
  github: 'https://github.com/splitsquads',
};

// Transaction Configuration
export const TRANSACTION_CONFIG = {
  commitment: 'confirmed' as const,
  preflightCommitment: 'processed' as const,
  maxRetries: 3,
  skipPreflight: false,
};

// UI Configuration
export const UI_CONFIG = {
  maxSquadNameLength: 32,
  maxSquadDescriptionLength: 200,
  maxTagsPerSquad: 5,
  minSquadSize: 2,
  maxSquadSize: 8,
  defaultSquadSize: 4,
};

// Staking Configuration
export const STAKING_CONFIG = {
  minStakeAmount: 1_000_000, // 1 SPLIT token (6 decimals)
  maxTenureDays: 90,
  maxSquadSizeMultiplier: 1.2,
  maxTenureMultiplier: 2.0,
  maxActivityMultiplier: 1.5,
  minActivityMultiplier: 0.5,
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient token balance',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_AMOUNT: 'Please enter a valid amount',
  SQUAD_FULL: 'This squad is full',
  ALREADY_MEMBER: 'You are already a member of this squad',
  NOT_SQUAD_MEMBER: 'You are not a member of this squad',
  UNAUTHORIZED: 'You are not authorized to perform this action',
};
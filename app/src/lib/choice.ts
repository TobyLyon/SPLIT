// Commit/Reveal choice system for SPLIT game
// Implements cryptographic commit-reveal scheme to prevent front-running

import { PublicKey } from '@solana/web3.js';
import { keccak256 } from 'js-sha3';

export type Choice = 'split' | 'steal';

// Convert choice to number for blockchain storage
export function choiceToNumber(choice: Choice): number {
  return choice === 'split' ? 0 : 1;
}

// Convert number back to choice
export function numberToChoice(num: number): Choice {
  return num === 0 ? 'split' : 'steal';
}

// Generate cryptographically secure salt
export function generateSalt(): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto) {
    const salt = new Uint8Array(32);
    window.crypto.getRandomValues(salt);
    return salt;
  } else if (typeof crypto !== 'undefined') {
    const salt = new Uint8Array(32);
    crypto.getRandomValues(salt);
    return salt;
  } else {
    // Fallback for environments without crypto
    const salt = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
    return salt;
  }
}

// Convert Uint8Array to hex string
export function saltToHex(salt: Uint8Array): string {
  return Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string back to Uint8Array
export function hexToSalt(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Create commit hash for choice
export function hashCommit(
  playerPubkey: PublicKey | string,
  dayUnix: number,
  choice: Choice,
  salt: Uint8Array
): string {
  const pubkeyStr = typeof playerPubkey === 'string' 
    ? playerPubkey 
    : playerPubkey.toString();
  
  const choiceNum = choiceToNumber(choice);
  const saltHex = saltToHex(salt);
  
  // Create commitment string: pubkey + dayUnix + choice + salt
  const commitmentData = `${pubkeyStr}${dayUnix}${choiceNum}${saltHex}`;
  
  // Hash using keccak256
  return keccak256(commitmentData);
}

// Verify that a revealed choice matches the commit hash
export function verifyReveal(
  playerPubkey: PublicKey | string,
  dayUnix: number,
  choice: Choice,
  salt: Uint8Array,
  commitHash: string
): boolean {
  const expectedHash = hashCommit(playerPubkey, dayUnix, choice, salt);
  return expectedHash === commitHash;
}

// Get current day unix timestamp (start of day UTC)
export function getCurrentDayUnix(): number {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  return Math.floor(startOfDay.getTime() / 1000);
}

// Get day unix for a specific date
export function getDayUnix(date: Date): number {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
  return Math.floor(startOfDay.getTime() / 1000);
}

// Convert day unix back to date
export function dayUnixToDate(dayUnix: number): Date {
  return new Date(dayUnix * 1000);
}

// Get time remaining until next phase
export function getTimeUntilNextPhase(currentTime: Date = new Date()): {
  phase: 'commit' | 'reveal' | 'settled';
  timeLeft: number;
  nextPhaseAt: Date;
} {
  const currentUtc = new Date(currentTime.getTime());
  const currentHour = currentUtc.getUTCHours();
  const currentMinute = currentUtc.getUTCMinutes();
  const currentSecond = currentUtc.getUTCSeconds();
  
  // Phase schedule (UTC):
  // 00:00-12:00: Commit phase (12 hours)
  // 12:00-18:00: Reveal phase (6 hours)
  // 18:00-24:00: Settled phase (6 hours)
  
  let phase: 'commit' | 'reveal' | 'settled';
  let nextPhaseAt: Date;
  
  if (currentHour < 12) {
    // Currently in commit phase
    phase = 'commit';
    nextPhaseAt = new Date(currentUtc);
    nextPhaseAt.setUTCHours(12, 0, 0, 0);
  } else if (currentHour < 18) {
    // Currently in reveal phase
    phase = 'reveal';
    nextPhaseAt = new Date(currentUtc);
    nextPhaseAt.setUTCHours(18, 0, 0, 0);
  } else {
    // Currently in settled phase
    phase = 'settled';
    nextPhaseAt = new Date(currentUtc);
    nextPhaseAt.setUTCDate(nextPhaseAt.getUTCDate() + 1);
    nextPhaseAt.setUTCHours(0, 0, 0, 0);
  }
  
  const timeLeft = nextPhaseAt.getTime() - currentUtc.getTime();
  
  return {
    phase,
    timeLeft,
    nextPhaseAt,
  };
}

// Format time remaining as HH:MM:SS
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '00:00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Choice storage for local persistence
export class ChoiceStorage {
  private static getKey(wallet: string, dayUnix: number): string {
    return `split_choice_${wallet}_${dayUnix}`;
  }
  
  static saveChoice(wallet: string, dayUnix: number, choice: Choice, salt: string): void {
    if (typeof window === 'undefined') return;
    
    const data = {
      choice,
      salt,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem(this.getKey(wallet, dayUnix), JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save choice to localStorage:', error);
    }
  }
  
  static getChoice(wallet: string, dayUnix: number): { choice: Choice; salt: string } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.getKey(wallet, dayUnix));
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return {
        choice: data.choice,
        salt: data.salt,
      };
    } catch (error) {
      console.warn('Failed to load choice from localStorage:', error);
      return null;
    }
  }
  
  static clearChoice(wallet: string, dayUnix: number): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.getKey(wallet, dayUnix));
    } catch (error) {
      console.warn('Failed to clear choice from localStorage:', error);
    }
  }
  
  static clearOldChoices(): void {
    if (typeof window === 'undefined') return;
    
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('split_choice_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && data.timestamp < cutoff) {
              localStorage.removeItem(key);
            }
          } catch {
            // Invalid data, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear old choices:', error);
    }
  }
}

// Feature flag for testing without blockchain
export function isFakeOnchainEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FAKE_ONCHAIN === 'true';
}

// Mock commit/reveal for testing
export async function mockCommitChoice(
  wallet: string,
  dayUnix: number,
  choice: Choice,
  salt: string,
  stakeAmount: number
): Promise<{ success: boolean; hash?: string; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  try {
    const pubkey = new PublicKey(wallet);
    const saltBytes = hexToSalt(salt);
    const hash = hashCommit(pubkey, dayUnix, choice, saltBytes);
    
    // Save to localStorage for testing
    ChoiceStorage.saveChoice(wallet, dayUnix, choice, salt);
    
    // Simulate random failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network error: Transaction failed');
    }
    
    console.log(`Mock commit: ${wallet} committed ${choice} for day ${dayUnix} with hash ${hash}`);
    
    return { success: true, hash };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function mockRevealChoice(
  wallet: string,
  dayUnix: number,
  choice: Choice,
  salt: string
): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  try {
    const pubkey = new PublicKey(wallet);
    const saltBytes = hexToSalt(salt);
    
    // Verify the choice matches what was stored
    const stored = ChoiceStorage.getChoice(wallet, dayUnix);
    if (!stored) {
      throw new Error('No committed choice found');
    }
    
    if (stored.choice !== choice || stored.salt !== salt) {
      throw new Error('Choice does not match commitment');
    }
    
    // Simulate random failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error: Reveal transaction failed');
    }
    
    console.log(`Mock reveal: ${wallet} revealed ${choice} for day ${dayUnix}`);
    
    return { success: true, verified: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Utility function to get next commit/reveal deadlines
export function getPhaseDeadlines(dayUnix: number): {
  commitDeadline: Date;
  revealDeadline: Date;
  settlementTime: Date;
} {
  const dayStart = dayUnixToDate(dayUnix);
  
  const commitDeadline = new Date(dayStart);
  commitDeadline.setUTCHours(12, 0, 0, 0); // 12:00 UTC
  
  const revealDeadline = new Date(dayStart);
  revealDeadline.setUTCHours(18, 0, 0, 0); // 18:00 UTC
  
  const settlementTime = new Date(dayStart);
  settlementTime.setUTCHours(24, 0, 0, 0); // 24:00 UTC (next day start)
  
  return {
    commitDeadline,
    revealDeadline,
    settlementTime,
  };
}

// Auto-cleanup old choices on app start
if (typeof window !== 'undefined') {
  // Run cleanup on page load
  ChoiceStorage.clearOldChoices();
  
  // Set up periodic cleanup (once per day)
  setInterval(() => {
    ChoiceStorage.clearOldChoices();
  }, 24 * 60 * 60 * 1000);
}
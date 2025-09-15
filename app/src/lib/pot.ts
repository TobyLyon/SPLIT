// Community pot data fetching and utilities
// Handles both mock data for testing and on-chain data when available

export interface CommunityPotData {
  current: number;
  target: number;
  nextUnlockAt: Date;
  contributors: number;
  lastUpdated: Date;
}

export interface PotEvent {
  id: string;
  type: 'contribution' | 'claim' | 'rollover';
  amount: number;
  wallet?: string;
  timestamp: Date;
  txHash?: string;
}

// Mock community pot data for testing
const MOCK_POT_DATA: CommunityPotData = {
  current: 12500,
  target: 50000,
  nextUnlockAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
  contributors: 47,
  lastUpdated: new Date(),
};

const MOCK_POT_EVENTS: PotEvent[] = [
  {
    id: '1',
    type: 'contribution',
    amount: 2500,
    wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    txHash: 'mock_tx_1',
  },
  {
    id: '2',
    type: 'contribution',
    amount: 1000,
    wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    txHash: 'mock_tx_2',
  },
  {
    id: '3',
    type: 'rollover',
    amount: 9000,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    txHash: 'mock_tx_3',
  },
];

// Feature flag for using mock data
export function useMockPotData(): boolean {
  return process.env.NEXT_PUBLIC_FAKE_ONCHAIN === 'true' || 
         process.env.NODE_ENV === 'development';
}

// Fetch current community pot data
export async function fetchCommunityPotData(): Promise<CommunityPotData> {
  if (useMockPotData()) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Add some randomness to mock data
    const variation = (Math.random() - 0.5) * 0.1; // ±5%
    const current = Math.max(0, MOCK_POT_DATA.current * (1 + variation));
    
    return {
      ...MOCK_POT_DATA,
      current: Math.floor(current),
      lastUpdated: new Date(),
    };
  }
  
  // TODO: Implement on-chain data fetching
  try {
    // This would connect to your Solana program to fetch real data
    const response = await fetch('/api/community-pot');
    if (!response.ok) {
      throw new Error('Failed to fetch community pot data');
    }
    
    const data = await response.json();
    return {
      current: data.current || 0,
      target: data.target || 50000,
      nextUnlockAt: new Date(data.nextUnlockAt || Date.now() + 24 * 60 * 60 * 1000),
      contributors: data.contributors || 0,
      lastUpdated: new Date(data.lastUpdated || Date.now()),
    };
  } catch (error) {
    console.error('Failed to fetch community pot data:', error);
    // Fallback to mock data
    return MOCK_POT_DATA;
  }
}

// Fetch recent pot events
export async function fetchPotEvents(limit: number = 10): Promise<PotEvent[]> {
  if (useMockPotData()) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    return MOCK_POT_EVENTS
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // TODO: Implement on-chain event fetching
  try {
    const response = await fetch(`/api/community-pot/events?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pot events');
    }
    
    const data = await response.json();
    return data.events.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp),
    }));
  } catch (error) {
    console.error('Failed to fetch pot events:', error);
    return [];
  }
}

// Calculate pot growth rate
export function calculatePotGrowthRate(events: PotEvent[]): {
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
} {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const contributions = events.filter(e => e.type === 'contribution');
  
  const hourlyContributions = contributions.filter(e => e.timestamp > oneHourAgo);
  const dailyContributions = contributions.filter(e => e.timestamp > oneDayAgo);
  const weeklyContributions = contributions.filter(e => e.timestamp > oneWeekAgo);
  
  const hourlyRate = hourlyContributions.reduce((sum, e) => sum + e.amount, 0);
  const dailyRate = dailyContributions.reduce((sum, e) => sum + e.amount, 0);
  const weeklyRate = weeklyContributions.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    hourlyRate,
    dailyRate,
    weeklyRate,
  };
}

// Estimate time until pot target is reached
export function estimateTimeToTarget(
  current: number, 
  target: number, 
  growthRate: number
): Date | null {
  if (current >= target) return new Date(); // Already reached
  if (growthRate <= 0) return null; // No growth
  
  const remaining = target - current;
  const hoursToTarget = remaining / growthRate;
  
  return new Date(Date.now() + hoursToTarget * 60 * 60 * 1000);
}

// Get pot unlock schedule
export function getPotUnlockSchedule(): Date[] {
  const now = new Date();
  const schedule: Date[] = [];
  
  // Generate next 7 unlock times (daily at 18:00 UTC)
  for (let i = 0; i < 7; i++) {
    const unlockDate = new Date(now);
    unlockDate.setUTCDate(now.getUTCDate() + i);
    unlockDate.setUTCHours(18, 0, 0, 0);
    
    // If today's unlock has passed, start from tomorrow
    if (i === 0 && unlockDate <= now) {
      continue;
    }
    
    schedule.push(unlockDate);
  }
  
  return schedule;
}

// Format pot amount for display
export function formatPotAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return amount.toFixed(0);
  }
}

// Get pot milestone thresholds
export const POT_MILESTONES = [
  { threshold: 10000, label: 'Community Building', reward: 'Bonus multipliers' },
  { threshold: 25000, label: 'Growing Strong', reward: 'Squad bonuses' },
  { threshold: 50000, label: 'Major Milestone', reward: 'Special events' },
  { threshold: 100000, label: 'Epic Achievement', reward: 'Legendary rewards' },
  { threshold: 250000, label: 'Hall of Fame', reward: 'Ultimate prizes' },
];

// Get current milestone progress
export function getCurrentMilestone(current: number): {
  current: typeof POT_MILESTONES[0] | null;
  next: typeof POT_MILESTONES[0] | null;
  progress: number;
} {
  let currentMilestone = null;
  let nextMilestone = null;
  
  for (let i = 0; i < POT_MILESTONES.length; i++) {
    if (current >= POT_MILESTONES[i].threshold) {
      currentMilestone = POT_MILESTONES[i];
    } else {
      nextMilestone = POT_MILESTONES[i];
      break;
    }
  }
  
  let progress = 0;
  if (nextMilestone) {
    const start = currentMilestone?.threshold || 0;
    const end = nextMilestone.threshold;
    progress = ((current - start) / (end - start)) * 100;
  } else if (currentMilestone) {
    progress = 100; // Reached max milestone
  }
  
  return {
    current: currentMilestone,
    next: nextMilestone,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

// Mock function to claim from community pot
export async function mockClaimFromPot(
  wallet: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  try {
    // Simulate random failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Transaction failed: Insufficient pot balance');
    }
    
    const mockTxHash = `claim_${wallet.slice(0, 8)}_${Date.now()}`;
    
    console.log(`Mock claim: ${wallet} claimed ${amount} from community pot`);
    
    return { success: true, txHash: mockTxHash };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Real-time pot updates (WebSocket simulation)
export class PotUpdates {
  private listeners: ((data: CommunityPotData) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;
  
  subscribe(callback: (data: CommunityPotData) => void): () => void {
    this.listeners.push(callback);
    
    // Start updates if this is the first listener
    if (this.listeners.length === 1) {
      this.startUpdates();
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
      
      // Stop updates if no more listeners
      if (this.listeners.length === 0) {
        this.stopUpdates();
      }
    };
  }
  
  private startUpdates(): void {
    // Update every 30 seconds
    this.interval = setInterval(async () => {
      try {
        const data = await fetchCommunityPotData();
        this.listeners.forEach(callback => callback(data));
      } catch (error) {
        console.error('Failed to fetch pot updates:', error);
      }
    }, 30000);
  }
  
  private stopUpdates(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Export singleton instance
export const potUpdates = new PotUpdates();

// Crew/Gang system for SPLIT game
// Includes progression, customization, and burn mechanics

export type CrewRank = 'rookie' | 'soldier' | 'lieutenant' | 'captain' | 'boss';
export type CrewRole = 'member' | 'officer' | 'leader';

export interface CrewCustomization {
  icon: string; // Icon identifier
  banner: string; // Banner pattern identifier
  primaryColor: string; // Hex color
  accentColor: string; // Hex color
  motto?: string; // Crew motto/tagline
  background?: string; // Background pattern
}

export interface CrewStats {
  totalMembers: number;
  activeMembers: number; // Members who played in last 7 days
  totalWins: number;
  totalLosses: number;
  winStreak: number;
  bestStreak: number;
  totalEarnings: number;
  avgDailyEarnings: number;
  crewRating: number; // Overall crew performance score
}

export interface CrewMember {
  wallet: string;
  handle?: string;
  avatar?: string;
  role: CrewRole;
  rank: CrewRank;
  joinedAt: string;
  contribution: number; // Contribution score to crew
  lastActive: string;
  isFounder: boolean;
}

export interface Crew {
  id: string;
  name: string;
  description?: string;
  customization: CrewCustomization;
  stats: CrewStats;
  members: CrewMember[];
  createdAt: string;
  isPublic: boolean; // Can anyone join or invite-only
  entryFee?: number; // Optional entry fee in tokens
  maxMembers: number;
  tags: string[]; // e.g., ['competitive', 'casual', 'high-stakes']
}

// Customization unlock requirements
export interface UnlockRequirement {
  type: 'rank' | 'wins' | 'earnings' | 'streak' | 'burn';
  value: number | string;
  description: string;
}

export interface CustomizationItem {
  id: string;
  name: string;
  category: 'icon' | 'banner' | 'color' | 'background' | 'effect';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlockRequirements: UnlockRequirement[];
  burnCost?: number; // Optional burn cost for premium items
  multiplier?: number; // Bonus multiplier when equipped
  preview: string; // Preview image or data
}

// Rank progression system
export const CREW_RANK_REQUIREMENTS: Record<CrewRank, UnlockRequirement[]> = {
  rookie: [],
  soldier: [
    { type: 'wins', value: 10, description: '10 crew wins' }
  ],
  lieutenant: [
    { type: 'wins', value: 50, description: '50 crew wins' },
    { type: 'earnings', value: 10000, description: '$10K crew earnings' }
  ],
  captain: [
    { type: 'wins', value: 200, description: '200 crew wins' },
    { type: 'earnings', value: 100000, description: '$100K crew earnings' },
    { type: 'streak', value: 15, description: '15 win streak' }
  ],
  boss: [
    { type: 'wins', value: 1000, description: '1000 crew wins' },
    { type: 'earnings', value: 1000000, description: '$1M crew earnings' },
    { type: 'streak', value: 50, description: '50 win streak' }
  ]
};

// Available customization items
export const CUSTOMIZATION_ITEMS: CustomizationItem[] = [
  // Icons - Common
  {
    id: 'skull-basic',
    name: 'Skull',
    category: 'icon',
    rarity: 'common',
    unlockRequirements: [],
    preview: '💀'
  },
  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    category: 'icon',
    rarity: 'common',
    unlockRequirements: [],
    preview: '💎'
  },
  
  // Icons - Rare
  {
    id: 'crown-gold',
    name: 'Golden Crown',
    category: 'icon',
    rarity: 'rare',
    unlockRequirements: [
      { type: 'rank', value: 'lieutenant', description: 'Reach Lieutenant rank' }
    ],
    preview: '👑'
  },
  
  // Icons - Epic (with burn cost)
  {
    id: 'dragon-fire',
    name: 'Fire Dragon',
    category: 'icon',
    rarity: 'epic',
    unlockRequirements: [
      { type: 'rank', value: 'captain', description: 'Reach Captain rank' }
    ],
    burnCost: 1000,
    multiplier: 1.05,
    preview: '🐉'
  },
  
  // Banners
  {
    id: 'banner-stripes',
    name: 'Battle Stripes',
    category: 'banner',
    rarity: 'common',
    unlockRequirements: [],
    preview: 'stripes-pattern'
  },
  {
    id: 'banner-lightning',
    name: 'Lightning Storm',
    category: 'banner',
    rarity: 'rare',
    unlockRequirements: [
      { type: 'streak', value: 10, description: '10 win streak' }
    ],
    preview: 'lightning-pattern'
  },
  
  // Colors - Premium with burn cost
  {
    id: 'color-neon-pink',
    name: 'Neon Pink',
    category: 'color',
    rarity: 'epic',
    unlockRequirements: [
      { type: 'earnings', value: 50000, description: '$50K earnings' }
    ],
    burnCost: 500,
    multiplier: 1.02,
    preview: '#FF10F0'
  },
  
  // Legendary items
  {
    id: 'icon-phoenix',
    name: 'Phoenix Rising',
    category: 'icon',
    rarity: 'legendary',
    unlockRequirements: [
      { type: 'rank', value: 'boss', description: 'Reach Boss rank' }
    ],
    burnCost: 5000,
    multiplier: 1.15,
    preview: '🔥🦅'
  }
];

// Burn mechanics
export interface BurnTransaction {
  id: string;
  wallet: string;
  crewId: string;
  amount: number;
  itemId: string;
  multiplierGained: number;
  timestamp: string;
  txHash?: string; // Blockchain transaction hash
}

// Utility functions
export function getCrewRankName(rank: CrewRank): string {
  const names = {
    rookie: 'Rookie',
    soldier: 'Soldier', 
    lieutenant: 'Lieutenant',
    captain: 'Captain',
    boss: 'Boss'
  };
  return names[rank];
}

export function getCrewRankColor(rank: CrewRank): string {
  const colors = {
    rookie: '#9CA3AF', // gray
    soldier: '#10B981', // green
    lieutenant: '#3B82F6', // blue
    captain: '#8B5CF6', // purple
    boss: '#F59E0B' // gold
  };
  return colors[rank];
}

export function calculateCrewRating(stats: CrewStats): number {
  const winRate = stats.totalWins / Math.max(stats.totalWins + stats.totalLosses, 1);
  const earningsPerMember = stats.totalEarnings / Math.max(stats.totalMembers, 1);
  const activityRate = stats.activeMembers / Math.max(stats.totalMembers, 1);
  
  return Math.round(
    (winRate * 40) + 
    (Math.min(earningsPerMember / 1000, 30)) + 
    (stats.winStreak * 2) +
    (activityRate * 20) +
    (stats.totalMembers * 0.5)
  );
}

export function canUnlockItem(item: CustomizationItem, member: CrewMember, crewStats: CrewStats): boolean {
  return item.unlockRequirements.every(req => {
    switch (req.type) {
      case 'rank':
        const rankOrder = ['rookie', 'soldier', 'lieutenant', 'captain', 'boss'];
        const currentRankIndex = rankOrder.indexOf(member.rank);
        const requiredRankIndex = rankOrder.indexOf(req.value as CrewRank);
        return currentRankIndex >= requiredRankIndex;
      
      case 'wins':
        return crewStats.totalWins >= (req.value as number);
      
      case 'earnings':
        return crewStats.totalEarnings >= (req.value as number);
      
      case 'streak':
        return crewStats.bestStreak >= (req.value as number);
      
      default:
        return false;
    }
  });
}

export function calculateBurnMultiplier(crewId: string, burnTransactions: BurnTransaction[]): number {
  const crewBurns = burnTransactions.filter(tx => tx.crewId === crewId);
  return crewBurns.reduce((total, tx) => total + tx.multiplierGained, 1.0);
}

// Mock data for development
export const MOCK_CREWS: Crew[] = [
  {
    id: 'crew-1',
    name: 'Diamond Hands',
    description: 'We never fold, we never sell, we always HODL',
    customization: {
      icon: 'diamond-hands',
      banner: 'banner-stripes',
      primaryColor: '#34F5C5',
      accentColor: '#9B5CFF',
      motto: 'HODL or DIE'
    },
    stats: {
      totalMembers: 25,
      activeMembers: 22,
      totalWins: 156,
      totalLosses: 44,
      winStreak: 8,
      bestStreak: 23,
      totalEarnings: 425000,
      avgDailyEarnings: 2850,
      crewRating: 92
    },
    members: [],
    createdAt: '2024-01-15T00:00:00Z',
    isPublic: true,
    maxMembers: 50,
    tags: ['competitive', 'high-stakes', 'crypto-native']
  },
  {
    id: 'crew-2', 
    name: 'Chaos Crew',
    description: 'Embrace the chaos, steal the pot',
    customization: {
      icon: 'skull-basic',
      banner: 'banner-lightning',
      primaryColor: '#EF4444',
      accentColor: '#F59E0B',
      motto: 'CHAOS REIGNS'
    },
    stats: {
      totalMembers: 18,
      activeMembers: 15,
      totalWins: 89,
      totalLosses: 67,
      winStreak: 3,
      bestStreak: 12,
      totalEarnings: 234000,
      avgDailyEarnings: 1560,
      crewRating: 74
    },
    members: [],
    createdAt: '2024-02-01T00:00:00Z',
    isPublic: true,
    maxMembers: 30,
    tags: ['aggressive', 'pvp', 'risk-takers']
  }
];

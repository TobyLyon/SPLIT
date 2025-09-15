// React Query hooks for SPLIT game database operations
// Provides type-safe data fetching with caching and real-time updates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { db, getCurrentDayUnix, Profile, UserStats, DailyChoice, Squad, SquadMember } from '@/lib/db';

// Query keys
export const queryKeys = {
  profile: (wallet: string) => ['profile', wallet] as const,
  profileByHandle: (handle: string) => ['profile', 'handle', handle] as const,
  userStats: (wallet: string) => ['userStats', wallet] as const,
  dailyChoice: (wallet: string, dayUnix: number) => ['dailyChoice', wallet, dayUnix] as const,
  squad: (squadId: string) => ['squad', squadId] as const,
  squadMembers: (squadId: string) => ['squadMembers', squadId] as const,
  squads: () => ['squads'] as const,
  leaderboard: (mode: string) => ['leaderboard', mode] as const,
  communityPot: () => ['communityPot'] as const,
  squadSync: (squadId: string, dayUnix: number) => ['squadSync', squadId, dayUnix] as const,
};

// Profile hooks
export function useProfile(wallet?: string) {
  return useQuery({
    queryKey: wallet ? queryKeys.profile(wallet) : [],
    queryFn: async () => {
      if (!wallet) return null;
      const { data, error } = await db.getProfile(wallet);
      if (error) throw error;
      return data;
    },
    enabled: !!wallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfileByHandle(handle?: string) {
  return useQuery({
    queryKey: handle ? queryKeys.profileByHandle(handle) : [],
    queryFn: async () => {
      if (!handle) return null;
      const { data, error } = await db.getProfileByHandle(handle);
      if (error) throw error;
      return data;
    },
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Omit<Profile, 'id' | 'created_at'>) => {
      const { data, error } = await db.createProfile(profile);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(queryKeys.profile(data.wallet), data);
        if (data.handle) {
          queryClient.setQueryData(queryKeys.profileByHandle(data.handle), data);
        }
      }
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ wallet, updates }: { wallet: string; updates: Partial<Profile> }) => {
      const { data, error } = await db.updateProfile(wallet, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(queryKeys.profile(data.wallet), data);
        if (data.handle) {
          queryClient.setQueryData(queryKeys.profileByHandle(data.handle), data);
        }
      }
    },
  });
}

// User stats hooks
export function useUserStats(wallet?: string) {
  return useQuery({
    queryKey: wallet ? queryKeys.userStats(wallet) : [],
    queryFn: async () => {
      if (!wallet) return null;
      const { data, error } = await db.getUserStats(wallet);
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors
      return data;
    },
    enabled: !!wallet,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Daily choice hooks
export function useDailyChoice(wallet?: string, dayUnix?: number) {
  const currentDay = dayUnix || getCurrentDayUnix();
  
  return useQuery({
    queryKey: wallet ? queryKeys.dailyChoice(wallet, currentDay) : [],
    queryFn: async () => {
      if (!wallet) return null;
      const { data, error } = await db.getDailyChoice(wallet, currentDay);
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors
      return data;
    },
    enabled: !!wallet,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

export function useCommitChoice() {
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  
  return useMutation({
    mutationFn: async ({ dayUnix }: { dayUnix: number }) => {
      if (!publicKey) throw new Error('Wallet not connected');
      const wallet = publicKey.toString();
      
      const { data, error } = await db.commitChoice(wallet, dayUnix);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && publicKey) {
        const wallet = publicKey.toString();
        queryClient.setQueryData(queryKeys.dailyChoice(wallet, data.day_unix), data);
      }
    },
  });
}

export function useRevealChoice() {
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  
  return useMutation({
    mutationFn: async ({ dayUnix, choice }: { dayUnix: number; choice: number }) => {
      if (!publicKey) throw new Error('Wallet not connected');
      const wallet = publicKey.toString();
      
      const { data, error } = await db.revealChoice(wallet, dayUnix, choice);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && publicKey) {
        const wallet = publicKey.toString();
        queryClient.setQueryData(queryKeys.dailyChoice(wallet, data.day_unix), data);
      }
    },
  });
}

// Squad hooks
export function useSquad(squadId?: string) {
  return useQuery({
    queryKey: squadId ? queryKeys.squad(squadId) : [],
    queryFn: async () => {
      if (!squadId) return null;
      const { data, error } = await db.getSquad(squadId);
      if (error) throw error;
      return data;
    },
    enabled: !!squadId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSquadMembers(squadId?: string) {
  return useQuery({
    queryKey: squadId ? queryKeys.squadMembers(squadId) : [],
    queryFn: async () => {
      if (!squadId) return null;
      const { data, error } = await db.getSquadMembers(squadId);
      if (error) throw error;
      return data;
    },
    enabled: !!squadId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllSquads() {
  return useQuery({
    queryKey: queryKeys.squads(),
    queryFn: async () => {
      const { data, error } = await db.getAllSquads();
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Leaderboard hooks
export function useLeaderboard(mode: 'weight' | 'streak' | 'winrate' = 'streak') {
  return useQuery({
    queryKey: queryKeys.leaderboard(mode),
    queryFn: async () => {
      const { data, error } = await db.getLeaderboard(mode);
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Community pot hooks
export function useCommunityPot() {
  return useQuery({
    queryKey: queryKeys.communityPot(),
    queryFn: async () => {
      const { data, error } = await db.getCommunityPotTotal();
      if (error) throw error;
      return data?.total || 0;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every minute
  });
}

// Squad sync hooks
export function useSquadSync(squadId?: string, dayUnix?: number) {
  const currentDay = dayUnix || getCurrentDayUnix();
  
  return useQuery({
    queryKey: squadId ? queryKeys.squadSync(squadId, currentDay) : [],
    queryFn: async () => {
      if (!squadId) return null;
      const { data, error } = await db.getSquadSyncStats(squadId, currentDay);
      if (error) throw error;
      return data;
    },
    enabled: !!squadId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

// Utility hooks
export function useCurrentWallet() {
  const { publicKey } = useWallet();
  return publicKey?.toString();
}

export function useCurrentProfile() {
  const wallet = useCurrentWallet();
  return useProfile(wallet);
}

export function useCurrentUserStats() {
  const wallet = useCurrentWallet();
  return useUserStats(wallet);
}

export function useCurrentDailyChoice() {
  const wallet = useCurrentWallet();
  return useDailyChoice(wallet);
}
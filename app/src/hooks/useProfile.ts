// Profile management hook for SPLIT game
// Handles user profiles, Twitter verification, and game stats

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import { checkTwitterVerification } from '@/lib/twitter-auth';

export interface UserProfile {
  id: string;
  wallet_address: string;
  twitter_handle?: string;
  twitter_id?: string;
  twitter_verified: boolean;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  
  // Game stats
  total_games_played: number;
  total_splits: number;
  total_steals: number;
  current_streak: number;
  best_streak: number;
  total_earned: number;
  total_staked: number;
  win_rate: number;
  
  // Reputation
  reputation_score: number;
  reputation_tier: string;
  trust_level: number;
  
  // Timestamps
  first_game_at?: string;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface GameParticipation {
  id: string;
  round_id: number;
  stake_amount: number;
  revealed_choice?: 'split' | 'steal';
  payout_amount: number;
  settled: boolean;
  created_at: string;
}

export interface ReputationChange {
  id: string;
  change_type: string;
  old_score: number;
  new_score: number;
  change_amount: number;
  reason?: string;
  created_at: string;
}

// Main profile hook
export function useProfile() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', publicKey.toBase58())
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile exists, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            wallet_address: publicKey.toBase58(),
          })
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as UserProfile;
      }

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!publicKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!publicKey) throw new Error('No wallet connected');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', publicKey.toBase58())
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', publicKey?.toBase58()], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}

// Game history hook
export function useGameHistory() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['gameHistory', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return [];
      
      // First get the profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', publicKey.toBase58())
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('round_participants')
        .select(`
          *,
          game_rounds (
            round_number,
            start_time,
            phase,
            settled
          )
        `)
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as GameParticipation[];
    },
    enabled: !!publicKey,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Reputation history hook
export function useReputationHistory() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['reputationHistory', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return [];
      
      // First get the profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', publicKey.toBase58())
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('reputation_changes')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ReputationChange[];
    },
    enabled: !!publicKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Twitter verification status hook
export function useTwitterVerification() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['twitterVerification', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return { isVerified: false };
      return await checkTwitterVerification(publicKey.toBase58());
    },
    enabled: !!publicKey,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Profile leaderboard hook
export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address, display_name, twitter_handle, avatar_url, reputation_score, reputation_tier, total_earned, current_streak, total_games_played, win_rate')
        .order('reputation_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Squad members profiles hook
export function useSquadMembers(squadId: string) {
  return useQuery({
    queryKey: ['squadMembers', squadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('squad_members')
        .select(`
          *,
          profiles (
            wallet_address,
            display_name,
            twitter_handle,
            avatar_url,
            reputation_score,
            reputation_tier,
            current_streak
          )
        `)
        .eq('squad_id', squadId);

      if (error) throw error;
      return data;
    },
    enabled: !!squadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User stats calculation hook
export function useUserStats() {
  const { profile } = useProfile();
  const { data: gameHistory } = useGameHistory();
  const { data: reputationHistory } = useReputationHistory();

  if (!profile) {
    return {
      totalGames: 0,
      winRate: 0,
      totalEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
      recentGames: [],
      reputationTrend: 'stable' as 'up' | 'down' | 'stable',
    };
  }

  // Calculate recent reputation trend
  const recentChanges = reputationHistory?.slice(0, 5) || [];
  const reputationTrend = recentChanges.length > 0 
    ? recentChanges.reduce((sum, change) => sum + change.change_amount, 0) > 0 
      ? 'up' : 'down'
    : 'stable';

  return {
    totalGames: profile.total_games_played,
    winRate: profile.win_rate,
    totalEarned: profile.total_earned,
    currentStreak: profile.current_streak,
    bestStreak: profile.best_streak,
    recentGames: gameHistory?.slice(0, 10) || [],
    reputationTrend,
    splitRate: profile.total_games_played > 0 
      ? (profile.total_splits / profile.total_games_played) * 100 
      : 0,
    stealRate: profile.total_games_played > 0 
      ? (profile.total_steals / profile.total_games_played) * 100 
      : 0,
  };
}

// Profile completion percentage
export function useProfileCompletion() {
  const { profile } = useProfile();
  const { data: twitterVerification } = useTwitterVerification();

  if (!profile) return 0;

  const fields = [
    profile.display_name,
    profile.bio,
    profile.avatar_url,
    twitterVerification?.isVerified,
    profile.total_games_played > 0, // Has played at least one game
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}

// Utility function to format reputation tier
export function getReputationTierInfo(tier: string) {
  const tiers = {
    'Newcomer': { 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-400/20', 
      minScore: 0,
      description: 'Just getting started'
    },
    'Trusted': { 
      color: 'text-brand', 
      bgColor: 'bg-brand/20', 
      minScore: 1200,
      description: 'Reliable player'
    },
    'Elite': { 
      color: 'text-purple-400', 
      bgColor: 'bg-purple-400/20', 
      minScore: 1500,
      description: 'Skilled strategist'
    },
    'Legend': { 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-400/20', 
      minScore: 2000,
      description: 'Master of the game'
    },
  };

  return tiers[tier as keyof typeof tiers] || tiers.Newcomer;
}

// Typed Supabase client for SPLIT game data
// Handles profiles, user stats, daily choices, squads, and community pot

import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Database types
export interface Profile {
  id: string;
  wallet: string;
  handle?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface UserStats {
  wallet: string;
  splits: number;
  steals: number;
  broken_streaks: number;
  best_streak: number;
  current_streak: number;
  winrate: number;
  rounds_joined: number;
  updated_at: string;
}

export interface DailyChoice {
  wallet: string;
  day_unix: number;
  committed: boolean;
  revealed: boolean;
  choice?: number; // 0 = split, 1 = steal
  created_at: string;
}

export interface Squad {
  id: string;
  name: string;
  emblem_url?: string;
  created_at: string;
}

export interface SquadMember {
  squad_id: string;
  wallet: string;
  role: string;
  joined_at: string;
}

export interface CommunityPotEvent {
  id: string;
  amount: number;
  event_type: 'contribution' | 'claim' | 'rollover';
  wallet?: string;
  day_unix: number;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface ApiListResponse<T> {
  data: T[] | null;
  error: PostgrestError | null;
  count?: number;
}

// Database client class
export class SplitDatabase {
  private supabase = supabase;

  // Profile operations
  async getProfile(wallet: string): Promise<ApiResponse<Profile>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('wallet', wallet)
      .single();

    return { data, error };
  }

  async getProfileByHandle(handle: string): Promise<ApiResponse<Profile>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .single();

    return { data, error };
  }

  async createProfile(profile: Omit<Profile, 'id' | 'created_at'>): Promise<ApiResponse<Profile>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();

    return { data, error };
  }

  async updateProfile(wallet: string, updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('wallet', wallet)
      .select()
      .single();

    return { data, error };
  }

  // User stats operations
  async getUserStats(wallet: string): Promise<ApiResponse<UserStats>> {
    const { data, error } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('wallet', wallet)
      .single();

    return { data, error };
  }

  async updateUserStats(wallet: string, stats: Partial<UserStats>): Promise<ApiResponse<UserStats>> {
    const { data, error } = await this.supabase
      .from('user_stats')
      .upsert([{ wallet, ...stats }], { onConflict: 'wallet' })
      .select()
      .single();

    return { data, error };
  }

  // Daily choice operations
  async getDailyChoice(wallet: string, dayUnix: number): Promise<ApiResponse<DailyChoice>> {
    const { data, error } = await this.supabase
      .from('daily_choices')
      .select('*')
      .eq('wallet', wallet)
      .eq('day_unix', dayUnix)
      .single();

    return { data, error };
  }

  async commitChoice(wallet: string, dayUnix: number): Promise<ApiResponse<DailyChoice>> {
    const { data, error } = await this.supabase
      .from('daily_choices')
      .upsert([{
        wallet,
        day_unix: dayUnix,
        committed: true,
        revealed: false,
      }], { onConflict: 'wallet,day_unix' })
      .select()
      .single();

    return { data, error };
  }

  async revealChoice(wallet: string, dayUnix: number, choice: number): Promise<ApiResponse<DailyChoice>> {
    const { data, error } = await this.supabase
      .from('daily_choices')
      .update({
        revealed: true,
        choice,
      })
      .eq('wallet', wallet)
      .eq('day_unix', dayUnix)
      .select()
      .single();

    return { data, error };
  }

  // Squad operations
  async getSquad(squadId: string): Promise<ApiResponse<Squad>> {
    const { data, error } = await this.supabase
      .from('squads')
      .select('*')
      .eq('id', squadId)
      .single();

    return { data, error };
  }

  async getAllSquads(): Promise<ApiListResponse<Squad>> {
    const { data, error, count } = await this.supabase
      .from('squads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    return { data, error, count: count || 0 };
  }

  async getSquadMembers(squadId: string): Promise<ApiListResponse<SquadMember & { profile: Profile }>> {
    const { data, error } = await this.supabase
      .from('squad_members')
      .select(`
        *,
        profile:profiles!inner(*)
      `)
      .eq('squad_id', squadId)
      .order('joined_at', { ascending: true });

    return { data, error };
  }

  async joinSquad(squadId: string, wallet: string): Promise<ApiResponse<SquadMember>> {
    const { data, error } = await this.supabase
      .from('squad_members')
      .insert([{
        squad_id: squadId,
        wallet,
        role: 'member',
      }])
      .select()
      .single();

    return { data, error };
  }

  async leaveSquad(squadId: string, wallet: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabase
      .from('squad_members')
      .delete()
      .eq('squad_id', squadId)
      .eq('wallet', wallet);

    return { error };
  }

  // Community pot operations
  async getCommunityPotTotal(): Promise<ApiResponse<{ total: number }>> {
    const { data, error } = await this.supabase
      .rpc('get_community_pot_total');

    return { data: data ? { total: data } : null, error };
  }

  async addCommunityPotEvent(event: Omit<CommunityPotEvent, 'id' | 'created_at'>): Promise<ApiResponse<CommunityPotEvent>> {
    const { data, error } = await this.supabase
      .from('community_pot_events')
      .insert([event])
      .select()
      .single();

    return { data, error };
  }

  // Leaderboard operations
  async getLeaderboard(mode: 'weight' | 'streak' | 'winrate' = 'streak', limit = 100): Promise<ApiListResponse<any>> {
    let query = this.supabase
      .from('user_stats')
      .select(`
        *,
        profile:profiles!inner(wallet, handle, avatar_url)
      `)
      .limit(limit);

    switch (mode) {
      case 'streak':
        query = query.order('current_streak', { ascending: false });
        break;
      case 'winrate':
        query = query.order('winrate', { ascending: false });
        break;
      case 'weight':
        // For now, use rounds_joined as weight proxy
        query = query.order('rounds_joined', { ascending: false });
        break;
    }

    const { data, error } = await query;
    return { data, error };
  }

  // Squad sync operations
  async getSquadSyncStats(squadId: string, dayUnix: number): Promise<ApiResponse<{
    total: number;
    committed: number;
    revealed: number;
  }>> {
    const { data: members, error: membersError } = await this.getSquadMembers(squadId);
    if (membersError || !members) {
      return { data: null, error: membersError };
    }

    const wallets = members.map(m => m.wallet);
    
    const { data: choices, error: choicesError } = await this.supabase
      .from('daily_choices')
      .select('*')
      .in('wallet', wallets)
      .eq('day_unix', dayUnix);

    if (choicesError) {
      return { data: null, error: choicesError };
    }

    const committed = choices?.filter(c => c.committed).length || 0;
    const revealed = choices?.filter(c => c.revealed).length || 0;

    return {
      data: {
        total: members.length,
        committed,
        revealed,
      },
      error: null,
    };
  }
}

// Export singleton instance
export const db = new SplitDatabase();

// Helper functions
export function getCurrentDayUnix(): number {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(startOfDay.getTime() / 1000);
}

export function formatWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function calculateWinRate(splits: number, steals: number): number {
  const total = splits + steals;
  if (total === 0) return 0;
  // Simplified win rate calculation - in reality this would be more complex
  return Math.round((splits / total) * 100);
}
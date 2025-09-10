import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface SquadMetadata {
  id: string;
  pubkey: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  twitter_handle?: string;
  twitter_profile_url?: string;
  twitter_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityScore {
  id: string;
  wallet_address: string;
  squad_pubkey?: string;
  score: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  type: 'squad' | 'member';
  pubkey: string;
  name: string;
  total_staked: number;
  member_count?: number;
  twitter_handle?: string;
  rank: number;
  updated_at: string;
}

// API functions
export async function getSquadMetadata(pubkey: string): Promise<SquadMetadata | null> {
  const { data, error } = await supabase
    .from('squad_metadata')
    .select('*')
    .eq('pubkey', pubkey)
    .single();
  
  if (error) return null;
  return data;
}

export async function createSquadMetadata(metadata: Omit<SquadMetadata, 'id' | 'created_at' | 'updated_at'>): Promise<SquadMetadata | null> {
  const { data, error } = await supabase
    .from('squad_metadata')
    .insert(metadata)
    .select()
    .single();
  
  if (error) return null;
  return data;
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateUserProfile(
  walletAddress: string, 
  updates: Partial<Omit<UserProfile, 'id' | 'wallet_address' | 'created_at'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ 
      wallet_address: walletAddress, 
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) return null;
  return data;
}

export async function getActivityScore(walletAddress: string, squadPubkey?: string): Promise<ActivityScore | null> {
  let query = supabase
    .from('activity_scores')
    .select('*')
    .eq('wallet_address', walletAddress);
  
  if (squadPubkey) {
    query = query.eq('squad_pubkey', squadPubkey);
  }
  
  const { data, error } = await query.single();
  
  if (error) return null;
  return data;
}

export async function updateActivityScore(
  walletAddress: string,
  score: number,
  squadPubkey?: string
): Promise<ActivityScore | null> {
  const { data, error } = await supabase
    .from('activity_scores')
    .upsert({
      wallet_address: walletAddress,
      squad_pubkey: squadPubkey,
      score,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) return null;
  return data;
}

export async function getLeaderboard(
  type: 'squad' | 'member' | 'all' = 'all',
  limit = 50
): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit);
  
  if (type !== 'all') {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) return [];
  return data;
}

export async function searchSquads(query: string, limit = 20): Promise<SquadMetadata[]> {
  const { data, error } = await supabase
    .from('squad_metadata')
    .select('*')
    .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
    .limit(limit);
  
  if (error) return [];
  return data;
}

export async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  
  if (error) return null;
  
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return publicData.publicUrl;
}
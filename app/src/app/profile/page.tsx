'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Twitter, 
  Shield, 
  Trophy, 
  Settings,
  Edit3,
  Check,
  X,
  Flame,
  Target,
  TrendingUp,
  Users,
  Crown,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TwitterVerification } from '@/components/profile/twitter-verification';
import { formatNumber, shortenAddress } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ProfileData {
  id: string;
  wallet_address: string;
  twitter_handle?: string;
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
}

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
  });
  const [showTwitterVerification, setShowTwitterVerification] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connected) {
      router.push('/');
    }
  }, [connected, mounted, router]);

  useEffect(() => {
    if (mounted && connected && publicKey) {
      loadProfile();
    }
  }, [mounted, connected, publicKey]);

  const loadProfile = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', publicKey.toBase58())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProfile(data);
        setEditData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
        });
      } else {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            wallet_address: publicKey.toBase58(),
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!publicKey || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editData.display_name,
          bio: editData.bio,
          location: editData.location,
          website: editData.website,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', publicKey.toBase58());

      if (error) throw error;

      setProfile({
        ...profile,
        ...editData,
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const getReputationColor = (tier: string) => {
    switch (tier) {
      case 'Legend': return 'text-yellow-400';
      case 'Elite': return 'text-purple-400';
      case 'Trusted': return 'text-brand';
      default: return 'text-gray-400';
    }
  };

  const getReputationIcon = (tier: string) => {
    switch (tier) {
      case 'Legend': return Crown;
      case 'Elite': return Star;
      case 'Trusted': return Shield;
      default: return User;
    }
  };

  if (!mounted) {
    return null;
  }

  if (!connected) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <Card variant="glass">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.wallet_address}`}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-brand/20"
              />
              {profile.twitter_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || shortenAddress(profile.wallet_address)}
                </h1>
                {profile.twitter_handle && (
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    @{profile.twitter_handle}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                {React.createElement(getReputationIcon(profile.reputation_tier), {
                  className: `w-5 h-5 ${getReputationColor(profile.reputation_tier)}`
                })}
                <span className={`font-medium ${getReputationColor(profile.reputation_tier)}`}>
                  {profile.reputation_tier}
                </span>
                <span className="text-muted-foreground">
                  ({formatNumber(profile.reputation_score)} pts)
                </span>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span>📍 {profile.location}</span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                    🔗 {profile.website}
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {!profile.twitter_verified && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowTwitterVerification(true)}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Verify Twitter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twitter Verification Modal */}
      {showTwitterVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTwitterVerification(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <TwitterVerification
              onVerificationComplete={() => {
                setShowTwitterVerification(false);
                loadProfile();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="glass" className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={editData.display_name}
                  onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  placeholder="Your location"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  placeholder="https://your-website.com"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveProfile} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Streak */}
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {profile.current_streak}
            </div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
            <div className="text-xs text-muted-foreground mt-1">
              Best: {profile.best_streak}
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-brand mx-auto mb-3" />
            <div className="text-3xl font-bold text-brand mb-1">
              {profile.win_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <Progress value={profile.win_rate} className="mt-2" variant="gradient" />
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-400 mb-1">
              {formatNumber(profile.total_earned / 1_000_000)}
            </div>
            <div className="text-sm text-muted-foreground">$SPLIT Earned</div>
          </CardContent>
        </Card>

        {/* Games Played */}
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">
              {profile.total_games_played}
            </div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game History */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Game Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Splits</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {profile.total_splits}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Steals</span>
              <Badge variant="outline" className="text-red-400 border-red-400">
                {profile.total_steals}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Staked</span>
              <span className="font-mono text-brand">
                {formatNumber(profile.total_staked / 1_000_000)} $SPLIT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Trust Level</span>
              <div className="flex items-center gap-2">
                <Progress value={profile.trust_level} className="w-20" />
                <span className="text-sm">{profile.trust_level}/100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Twitter Verified</span>
              {profile.twitter_verified ? (
                <Badge variant="arcade" className="bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  <X className="w-3 h-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Wallet Address</span>
              <span className="font-mono text-xs text-muted-foreground">
                {shortenAddress(profile.wallet_address)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Member Since</span>
              <span className="text-sm text-muted-foreground">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>

            {!profile.twitter_verified && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setShowTwitterVerification(true)}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Verify Twitter Account
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

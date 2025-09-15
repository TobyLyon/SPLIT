'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { 
  ArrowLeft, Twitter, ExternalLink, Users, TrendingUp, 
  Trophy, Copy, Settings, Shield 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useSquadsByAuthority } from '@/hooks/useBlockchain';
import { useNotifications } from '@/hooks/useNotifications';
import { TwitterVerification } from '@/components/twitter/twitter-verification';
import { formatNumber, shortenAddress, calculateTimeAgo } from '@/lib/utils';
import { getUserProfile } from '@/lib/supabase';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { addNotification } = useNotifications();
  
  const [mounted, setMounted] = useState(false);
  const [showTwitterVerification, setShowTwitterVerification] = useState(false);
  
  const handle = params.handle as string;
  const isOwnProfile = publicKey?.toString() === handle || handle.startsWith(publicKey?.toString().slice(0, 8) || '');
  
  // Data queries
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', handle],
    queryFn: async () => {
      // Try to get profile by wallet address or Twitter handle
      const profile = await getUserProfile(handle);
      return profile;
    },
    enabled: !!handle,
  });
  
  const { data: userSquads = [], isLoading: squadsLoading } = useSquadsByAuthority(
    userProfile?.wallet_address ? new PublicKey(userProfile.wallet_address) : null
  );
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/10 rounded w-1/4"></div>
          <div className="h-64 bg-white/10 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const walletAddress = userProfile?.wallet_address || handle;
  const totalStaked = userSquads.reduce((sum, squad) => sum + Number(squad.data.totalStaked), 0) / 1_000_000;
  
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      addNotification({
        type: 'success',
        title: 'Address Copied',
        message: 'Wallet address copied to clipboard',
      });
    } catch (error) {
      addNotification({
        type: 'info',
        title: 'Copy Address',
        message: walletAddress,
        duration: 10000,
      });
    }
  };
  
  const handleTwitterVerified = (twitterHandle: string, profileUrl: string) => {
    addNotification({
      type: 'success',
      title: 'Twitter Linked!',
      message: `Successfully linked ${twitterHandle}`,
    });
    setShowTwitterVerification(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </motion.div>
      
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card variant="glass-strong" className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-brand to-accent flex items-center justify-center">
                <span className="text-bg font-bold text-2xl">
                  {userProfile?.twitter_handle 
                    ? userProfile.twitter_handle.slice(1, 3).toUpperCase()
                    : shortenAddress(walletAddress).slice(0, 2).toUpperCase()
                  }
                </span>
              </div>
              {userProfile?.twitter_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Twitter className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gradient-dual">
                  {userProfile?.twitter_handle || shortenAddress(walletAddress)}
                </h1>
                {userProfile?.twitter_verified && (
                  <Badge variant="glass" className="text-blue-400">
                    <Twitter className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-brand transition-colors"
                >
                  <span className="font-mono">{shortenAddress(walletAddress)}</span>
                  <Copy className="h-3 w-3" />
                </button>
                
                {userProfile?.twitter_profile_url && (
                  <a
                    href={userProfile.twitter_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Twitter className="h-3 w-3" />
                    <span>Twitter</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{userSquads.length} squads</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{formatNumber(totalStaked)} $SPLIT staked</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            {isOwnProfile && (
              <div className="flex items-center space-x-3">
                {!userProfile?.twitter_verified && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowTwitterVerification(true)}
                    disabled={!connected}
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    Link Twitter
                  </Button>
                )}
                
                <Button variant="glass" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-mint mb-2">
            {formatNumber(totalStaked)}
          </div>
          <p className="text-sm text-muted-foreground">Total Staked</p>
        </Card>
        
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-violet mb-2">
            {userSquads.length}
          </div>
          <p className="text-sm text-muted-foreground">Active Squads</p>
        </Card>
        
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-mint mb-2">
            0
          </div>
          <p className="text-sm text-muted-foreground">Total Rewards</p>
        </Card>
        
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-violet mb-2">
            --
          </div>
          <p className="text-sm text-muted-foreground">Global Rank</p>
        </Card>
      </motion.div>
      
      {/* User's Squads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-brand" />
              <span>{isOwnProfile ? 'My Squads' : 'Squads'}</span>
            </CardTitle>
            <CardDescription>
              {isOwnProfile ? 'Your squad memberships' : `${userProfile?.twitter_handle || 'User'}'s squad memberships`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {squadsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 rounded-lg glass">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="h-5 bg-white/10 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 bg-white/10 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userSquads.length > 0 ? (
              <div className="space-y-4">
                {userSquads.map((squad) => (
                  <Card 
                    key={squad.pubkey.toString()} 
                    variant="glass" 
                    className="p-4 hover:scale-[1.01] transition-transform cursor-pointer"
                    onClick={() => router.push(`/squad/${squad.pubkey.toString()}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{squad.data.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{squad.data.memberCount}/{squad.data.maxMembers} members</span>
                          <span>{formatNumber(Number(squad.data.totalStaked) / 1_000_000)} $SPLIT</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={squad.data.memberCount < squad.data.maxMembers ? 'mint' : 'glass'}>
                          {squad.data.memberCount < squad.data.maxMembers ? 'Open' : 'Full'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{isOwnProfile ? "You haven't joined any squads yet" : "This user hasn't joined any squads yet"}</p>
                {isOwnProfile && (
                  <Button 
                    className="mt-4" 
                    onClick={() => router.push('/squads')}
                  >
                    Discover Squads
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Twitter Verification Modal */}
      <TwitterVerification
        isOpen={showTwitterVerification}
        onClose={() => setShowTwitterVerification(false)}
        onVerified={handleTwitterVerified}
      />
    </div>
  );
}
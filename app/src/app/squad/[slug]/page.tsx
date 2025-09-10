'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  ArrowLeft, Users, TrendingUp, Trophy, Share2, 
  Plus, Minus, ExternalLink, Copy, Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSquad, useSquadMembers, useMember, useJoinSquad, useStakeTokens, useUnstakeTokens } from '@/hooks/useBlockchain';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useNotifications } from '@/hooks/useNotifications';
import { formatNumber, shortenAddress, calculateTimeAgo } from '@/lib/utils';
import { StakingModal } from '@/components/staking/staking-modal';

export default function SquadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { addNotification } = useNotifications();
  
  const [mounted, setMounted] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [stakingAction, setStakingAction] = useState<'stake' | 'unstake'>('stake');
  
  const squadPubkey = params.slug as string;
  
  // Data queries
  const { data: squad, isLoading: squadLoading } = useSquad(squadPubkey);
  const { data: members = [], isLoading: membersLoading } = useSquadMembers(squadPubkey);
  const { data: userMember } = useMember(squadPubkey, publicKey);
  const { data: balance } = useWalletBalance();
  
  // Mutations
  const joinSquadMutation = useJoinSquad();
  const stakeTokensMutation = useStakeTokens();
  const unstakeTokensMutation = useUnstakeTokens();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  if (squadLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/10 rounded w-1/4"></div>
          <div className="h-64 bg-white/10 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!squad) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card variant="glass" className="p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Squad Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The squad you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/squads')}>
            Browse Squads
          </Button>
        </Card>
      </div>
    );
  }
  
  const isSquadMember = !!userMember;
  const isSquadFull = squad.data.memberCount >= squad.data.maxMembers;
  const userStakeAmount = userMember ? Number(userMember.data.stakeAmount) / 1_000_000 : 0;
  
  const handleJoinSquad = async () => {
    if (!connected) {
      addNotification({
        type: 'warning',
        title: 'Wallet Required',
        message: 'Please connect your wallet to join this squad.',
      });
      return;
    }
    
    if (isSquadFull) {
      addNotification({
        type: 'error',
        title: 'Squad Full',
        message: 'This squad has reached its maximum capacity.',
      });
      return;
    }
    
    await joinSquadMutation.mutateAsync(squadPubkey);
  };
  
  const handleStaking = (action: 'stake' | 'unstake') => {
    if (!connected) {
      addNotification({
        type: 'warning',
        title: 'Wallet Required',
        message: 'Please connect your wallet to stake tokens.',
      });
      return;
    }
    
    if (!isSquadMember) {
      addNotification({
        type: 'warning',
        title: 'Join Squad First',
        message: 'You must be a member of this squad to stake tokens.',
      });
      return;
    }
    
    setStakingAction(action);
    setShowStakingModal(true);
  };
  
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      addNotification({
        type: 'success',
        title: 'Link Copied',
        message: 'Squad link copied to clipboard!',
      });
    } catch (error) {
      addNotification({
        type: 'info',
        title: 'Share Squad',
        message: url,
        duration: 10000,
      });
    }
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
      
      {/* Squad Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card variant="glass-strong" className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gradient-dual">
                  {squad.data.name}
                </h1>
                <Badge variant={isSquadFull ? 'glass' : 'mint'}>
                  {isSquadFull ? 'Full' : 'Open'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{squad.data.memberCount}/{squad.data.maxMembers} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{formatNumber(Number(squad.data.totalStaked) / 1_000_000)} $SPLIT staked</span>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Squad ID: {shortenAddress(squadPubkey)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="glass" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              
              {!isSquadMember && !isSquadFull && (
                <Button 
                  onClick={handleJoinSquad}
                  loading={joinSquadMutation.isPending}
                  disabled={!connected}
                >
                  {connected ? 'Join Squad' : 'Connect Wallet'}
                </Button>
              )}
              
              {isSquadMember && (
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleStaking('stake')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Stake
                  </Button>
                  {userStakeAmount > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleStaking('unstake')}
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Unstake
                    </Button>
                  )}
                </div>
              )}
            </div>
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
            {formatNumber(Number(squad.data.totalStaked) / 1_000_000)}
          </div>
          <p className="text-sm text-muted-foreground">Total Staked</p>
        </Card>
        
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-violet mb-2">
            {squad.data.memberCount}
          </div>
          <p className="text-sm text-muted-foreground">Active Members</p>
        </Card>
        
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-mint mb-2">
            {userStakeAmount > 0 ? formatNumber(userStakeAmount) : '0'}
          </div>
          <p className="text-sm text-muted-foreground">Your Stake</p>
        </Card>
        
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-violet mb-2">
            0
          </div>
          <p className="text-sm text-muted-foreground">Recent Rewards</p>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card variant="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-brand-mint" />
                <span>Squad Members</span>
              </CardTitle>
              <CardDescription>
                Current members and their contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {membersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                      <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-white/10 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length > 0 ? (
                members.map((member) => (
                  <Card key={member.pubkey.toString()} variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-brand-mint to-brand-violet flex items-center justify-center">
                          <span className="text-brand-dark font-bold text-sm">
                            {shortenAddress(member.data.authority.toString()).slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {shortenAddress(member.data.authority.toString())}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Joined {calculateTimeAgo(Number(member.data.joinTimestamp))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-mono text-brand-mint">
                          {formatNumber(Number(member.data.stakeAmount) / 1_000_000)} $SPLIT
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Activity: {member.data.activityScore}/100
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No members yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Squad Info & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Your Position */}
          {isSquadMember && (
            <Card variant="glass-strong">
              <CardHeader>
                <CardTitle className="text-lg">Your Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Staked Amount</span>
                    <span className="font-mono text-brand-mint">
                      {formatNumber(userStakeAmount)} $SPLIT
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Squad Share</span>
                      <span>
                        {Number(squad.data.totalStaked) > 0 
                          ? ((userStakeAmount * 1_000_000 / Number(squad.data.totalStaked)) * 100).toFixed(1)
                          : '0'
                        }%
                      </span>
                    </div>
                    <Progress 
                      value={Number(squad.data.totalStaked) > 0 
                        ? (userStakeAmount * 1_000_000 / Number(squad.data.totalStaked)) * 100 
                        : 0
                      } 
                      variant="gradient"
                    />
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => handleStaking('stake')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Stake More
                  </Button>
                  {userStakeAmount > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleStaking('unstake')}
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Unstake
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Squad Stats */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Squad Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Created</span>
                <span className="text-muted-foreground">Recently</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Max Members</span>
                <span className="font-mono">{squad.data.maxMembers}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Squad Authority</span>
                <span className="font-mono text-brand-mint">
                  {shortenAddress(squad.data.authority.toString())}
                </span>
              </div>
              
              <div className="pt-2">
                <Button variant="glass" className="w-full justify-start" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Staking Modal */}
      <StakingModal
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
        action={stakingAction}
        squadPubkey={squadPubkey}
        currentStake={userStakeAmount}
        maxStake={balance?.split || 0}
        onStake={async (amount) => {
          await stakeTokensMutation.mutateAsync({ squadPubkey, amount });
          setShowStakingModal(false);
        }}
        onUnstake={async (amount) => {
          await unstakeTokensMutation.mutateAsync({ squadPubkey, amount });
          setShowStakingModal(false);
        }}
        isLoading={stakeTokensMutation.isPending || unstakeTokensMutation.isPending}
      />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Trophy, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatNumber, shortenAddress } from '@/lib/utils';
import { useSquadsByAuthority } from '@/hooks/useBlockchain';
import { useWalletBalance } from '@/hooks/useWalletBalance';

// Real user stats calculation
function useUserStats(publicKey: any) {
  const { data: userSquads = [] } = useSquadsByAuthority(publicKey);
  const { data: _balance } = useWalletBalance();
  
  const totalStaked = userSquads.reduce((sum, _squad) => {
    // This would need to be calculated from member data
    return sum + 0; // TODO: Get actual user stake from member accounts
  }, 0);
  
  return {
    totalStaked,
    totalRewards: 0, // TODO: Calculate from transaction history
    activeSquads: userSquads.length,
    rank: 0, // TODO: Calculate from leaderboard position
    squads: userSquads,
  };
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const userStats = useUserStats(publicKey);
  const { data: balance } = useWalletBalance();
  
  // Mock recent activity data
  const recentActivity = [
    {
      type: 'reward',
      description: 'Squad reward distributed',
      amount: '125 $SPLIT',
      timestamp: '2 hours ago',
      squad: 'Alpha Squad',
      time: '2 hours ago'
    },
    {
      type: 'stake',
      description: 'Staked tokens to Alpha Squad',
      amount: '1,000 $SPLIT',
      timestamp: '1 day ago',
      squad: 'Alpha Squad',
      time: '1 day ago'
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connected) {
      router.push('/');
    }
  }, [connected, mounted, router]);

  if (!mounted) {
    return null;
  }

  if (!connected) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-dual mb-2">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              {publicKey && shortenAddress(publicKey.toString())}
            </p>
          </div>
          <Button onClick={() => router.push('/squads/create')} className="group">
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
            Create Squad
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-mint">
              {balance ? formatNumber(balance.split) : '0'} $SPLIT
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-violet">
              {formatNumber(userStats.totalRewards)} $SPLIT
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Squads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-mint">
              {userStats.activeSquads}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Global Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-violet">
              #{userStats.rank}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Squads */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card variant="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-brand" />
                <span>My Squads</span>
              </CardTitle>
              <CardDescription>
                Your active squad memberships and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userStats.squads.map((squad) => (
                <Card key={squad.pubkey.toString()} variant="glass" className="p-4 hover:scale-[1.01] transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{squad.data.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {squad.data.memberCount}/{squad.data.maxMembers} members
                      </p>
                    </div>
                    <Badge variant="arcade">
                      +0 $SPLIT
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Stake</span>
                      <span className="font-mono">{formatNumber(0)} $SPLIT</span>
                    </div>
                    <Progress 
                      value={0} 
                      variant="gradient"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Squad Total: {formatNumber(squad.data.totalStaked.toNumber())} $SPLIT</span>
                      <span>0% share</span>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="glass" 
                className="w-full"
                onClick={() => router.push('/squads')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Join Another Squad
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-accent" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg glass">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'reward' ? 'bg-brand' :
                    activity.type === 'stake' ? 'bg-accent' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.type === 'reward' && `+${activity.amount} $SPLIT reward`}
                      {activity.type === 'stake' && `Staked ${activity.amount} $SPLIT`}
                      {activity.type === 'join' && 'Joined squad'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.squad} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass" className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="glass" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Stake More Tokens
              </Button>
              <Button variant="glass" className="w-full justify-start">
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboard
              </Button>
              <Button variant="glass" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Invite Friends
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
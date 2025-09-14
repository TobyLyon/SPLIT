'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, TrendingUp, Medal, Crown, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, shortenAddress } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

// Real leaderboard data hook
function useLeaderboard(type: 'squad' | 'member' | 'all' = 'all') {
  return useQuery({
    queryKey: ['leaderboard', type],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?type=${type}&limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      return data.entries || [];
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });
}

type LeaderboardType = 'squads' | 'members';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('squads');
  const [mounted, setMounted] = useState(false);
  
  // Real data hooks
  const { data: leaderboardData = [], isLoading } = useLeaderboard(activeTab === 'squads' ? 'squad' : 'member');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-mono">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'arcade';
      case 2:
        return 'violet';
      case 3:
        return 'mint';
      default:
        return 'glass';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gradient-dual mb-4">
          <Trophy className="inline-block mr-3 h-8 w-8" />
          Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compete with the best squads and members on SplitSquads. 
          Rankings are updated in real-time based on total staked tokens and activity.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <Card variant="glass" className="p-1">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'squads' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('squads')}
              className="px-6"
            >
              <Users className="mr-2 h-4 w-4" />
              Top Squads
            </Button>
            <Button
              variant={activeTab === 'members' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('members')}
              className="px-6"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Top Members
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {activeTab === 'squads' ? (
                <>
                  <Users className="h-5 w-5 text-brand-mint" />
                  <span>Top Squads</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 text-brand-violet" />
                  <span>Top Members</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {activeTab === 'squads' 
                ? 'Squads ranked by total staked tokens and member count'
                : 'Individual members ranked by total staked tokens'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              [...Array(10)].map((_, i) => (
                <Card key={i} variant="glass" className="p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-white/10 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-1/3"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 bg-white/10 rounded w-20 mb-1"></div>
                      <div className="h-4 bg-white/10 rounded w-16"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : leaderboardData.length > 0 ? (
              leaderboardData.map((entry: any, index: number) => (
                <motion.div
                  key={entry.pubkey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    variant="glass" 
                    className={`p-6 hover:scale-[1.01] transition-all duration-300 ${
                      entry.rank <= 3 ? 'border-brand-mint/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg glass">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Info */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{entry.name}</h3>
                            {entry.rank <= 3 && (
                              <Badge variant={getRankBadgeVariant(entry.rank)}>
                                {entry.rank === 1 ? '👑 Champion' : 
                                 entry.rank === 2 ? '🥈 Runner-up' : 
                                 '🥉 Third Place'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{shortenAddress(entry.pubkey)}</span>
                            {activeTab === 'squads' && entry.member_count && (
                              <span>{entry.member_count} members</span>
                            )}
                            {activeTab === 'members' && entry.twitter_handle && (
                              <a 
                                href={`https://twitter.com/${entry.twitter_handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-mint hover:underline"
                              >
                                {entry.twitter_handle}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gradient-mint">
                          {formatNumber(entry.total_staked / 1_000_000)} $SPLIT
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Rank #{entry.rank}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No {activeTab} found</p>
                <p className="text-sm">Be the first to create a squad and start staking!</p>
              </div>
            )}

            {/* Load More Button */}
            <div className="text-center pt-4">
              <Button variant="glass" size="lg">
                Load More Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto"
      >
        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-mint mb-2">
            {formatNumber(1250000)}
          </div>
          <p className="text-sm text-muted-foreground">Total Staked</p>
        </Card>

        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-violet mb-2">
            {formatNumber(89500)}
          </div>
          <p className="text-sm text-muted-foreground">Rewards Distributed</p>
        </Card>

        <Card variant="glass" className="text-center p-6">
          <div className="text-2xl font-bold text-gradient-mint mb-2">
            {formatNumber(1847)}
          </div>
          <p className="text-sm text-muted-foreground">Active Members</p>
        </Card>
      </motion.div>
    </div>
  );
}
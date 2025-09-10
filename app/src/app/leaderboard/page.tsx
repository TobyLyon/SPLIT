'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, TrendingUp, Medal, Crown, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, shortenAddress } from '@/lib/utils';

// Mock leaderboard data
const mockLeaderboard = {
  squads: [
    {
      rank: 1,
      name: 'DeFi Legends',
      pubkey: 'ABC123...',
      totalStaked: 150000,
      memberCount: 8,
      recentRewards: 2500,
    },
    {
      rank: 2,
      name: 'Solana Builders',
      pubkey: 'DEF456...',
      totalStaked: 125000,
      memberCount: 6,
      recentRewards: 2100,
    },
    {
      rank: 3,
      name: 'Crypto Innovators',
      pubkey: 'GHI789...',
      totalStaked: 98000,
      memberCount: 7,
      recentRewards: 1800,
    },
    {
      rank: 4,
      name: 'Web3 Warriors',
      pubkey: 'JKL012...',
      totalStaked: 87000,
      memberCount: 5,
      recentRewards: 1650,
    },
    {
      rank: 5,
      name: 'Blockchain Bros',
      pubkey: 'MNO345...',
      totalStaked: 76000,
      memberCount: 4,
      recentRewards: 1400,
    },
  ],
  members: [
    {
      rank: 1,
      name: 'CryptoWhale',
      pubkey: 'ABC123...',
      totalStaked: 45000,
      twitterHandle: '@cryptowhale',
      recentRewards: 850,
    },
    {
      rank: 2,
      name: 'DefiMaster',
      pubkey: 'DEF456...',
      totalStaked: 38000,
      twitterHandle: '@defimaster',
      recentRewards: 720,
    },
    {
      rank: 3,
      name: 'SolanaBuilder',
      pubkey: 'GHI789...',
      totalStaked: 32000,
      twitterHandle: '@solanabuilder',
      recentRewards: 650,
    },
    {
      rank: 4,
      name: 'TokenStaker',
      pubkey: 'JKL012...',
      totalStaked: 28000,
      twitterHandle: '@tokenstaker',
      recentRewards: 580,
    },
    {
      rank: 5,
      name: 'YieldFarmer',
      pubkey: 'MNO345...',
      totalStaked: 25000,
      twitterHandle: '@yieldfarmer',
      recentRewards: 520,
    },
  ],
};

type LeaderboardType = 'squads' | 'members';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('squads');
  const [mounted, setMounted] = useState(false);

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
            {mockLeaderboard[activeTab].map((entry, index) => (
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
                          {activeTab === 'squads' && (
                            <span>{entry.memberCount} members</span>
                          )}
                          {activeTab === 'members' && 'twitterHandle' in entry && entry.twitterHandle && (
                            <a 
                              href={`https://twitter.com/${entry.twitterHandle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-mint hover:underline"
                            >
                              {entry.twitterHandle}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-gradient-mint">
                        {formatNumber(entry.totalStaked)} $SPLIT
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +{formatNumber(entry.recentRewards)} rewards
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

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
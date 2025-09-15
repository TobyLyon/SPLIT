'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Shield, 
  Timer, 
  TrendingUp, 
  Users, 
  Trophy,
  Coins,
  Flame,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';

// Mock game state for demonstration
const mockGameState = {
  currentRound: {
    id: 1,
    timeLeft: 3600, // 1 hour
    phase: 'commit', // commit | reveal | settled
    totalStaked: 125000,
    participants: 47,
  },
  communityPot: 89750,
  playerStats: {
    currentStreak: 7,
    bestStreak: 12,
    totalEarned: 3420,
    winRate: 73,
    splits: 15,
    steals: 8,
    reputation: 'Trusted Splitter',
  }
};

type Choice = 'split' | 'steal' | null;

export default function GamePage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState<Choice>(null);
  const [committed, setCommitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('1000');

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCommit = () => {
    if (choice) {
      setCommitted(true);
      // In real implementation: call commit_choice instruction
    }
  };

  const handleReveal = () => {
    setRevealed(true);
    // In real implementation: call reveal_choice instruction
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with Community Pot */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-6 rounded-2xl border border-brand/20"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Coins className="w-8 h-8 text-brand" />
            <h1 className="text-3xl font-bold">Community Pot</h1>
          </div>
          <div className="text-6xl font-bold text-brand mb-2">
            {formatNumber(mockGameState.communityPot)} $SPLIT
          </div>
          <p className="text-muted-foreground">Ready to claim when unlocked</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Round Timer */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-accent" />
                  <CardTitle>Round #{mockGameState.currentRound.id}</CardTitle>
                </div>
                <Badge variant="arcade" className="bg-accent">
                  {mockGameState.currentRound.phase.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-mono font-bold text-brand">
                  {formatTime(mockGameState.currentRound.timeLeft)}
                </div>
                <Progress value={65} variant="gradient" className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{mockGameState.currentRound.participants} players</span>
                  <span>{formatNumber(mockGameState.currentRound.totalStaked)} $SPLIT staked</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Choice Interface */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Make Your Choice
              </CardTitle>
              <CardDescription>
                Commit your choice for today's round. Choose wisely!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stake Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Stake Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="flex-1 px-4 py-2 glass rounded-lg border border-white/10 bg-background/50"
                    placeholder="Enter amount..."
                    disabled={committed}
                  />
                  <span className="px-4 py-2 text-brand font-medium">$SPLIT</span>
                </div>
              </div>

              {/* Choice Buttons */}
              {!committed ? (
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={choice === 'split' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setChoice('split')}
                      className="w-full h-24 flex-col gap-2"
                    >
                      <Shield className="w-8 h-8" />
                      <span className="text-lg font-bold">SPLIT</span>
                      <span className="text-xs opacity-75">Share the rewards</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={choice === 'steal' ? 'secondary' : 'outline'}
                      size="lg"
                      onClick={() => setChoice('steal')}
                      className="w-full h-24 flex-col gap-2"
                    >
                      <Zap className="w-8 h-8" />
                      <span className="text-lg font-bold">STEAL</span>
                      <span className="text-xs opacity-75">Take the boost</span>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-brand">
                    <EyeOff className="w-5 h-5" />
                    <span className="font-medium">Choice Committed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wait for reveal phase to show your choice
                  </p>
                </div>
              )}

              {/* Action Button */}
              {!committed && choice && (
                <Button
                  onClick={handleCommit}
                  size="lg"
                  variant="gradient"
                  className="w-full"
                >
                  Commit Choice
                </Button>
              )}

              {committed && !revealed && mockGameState.currentRound.phase === 'reveal' && (
                <Button
                  onClick={handleReveal}
                  size="lg"
                  variant="default"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Choice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Game Mechanics Explanation */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>How Split or Steal Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-brand">
                    <Shield className="w-4 h-4" />
                    Split + Split
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Both players share the pool equally. Everyone wins!
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-accent">
                    <Zap className="w-4 h-4" />
                    Split + Steal
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stealer gets boosted rewards, splitter gets reduced share.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-red-400">
                    <Zap className="w-4 h-4" />
                    Steal + Steal
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Both players get slashed! Slashed amount goes to community pot.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-yellow-400">
                    <Flame className="w-4 h-4" />
                    Streaks
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consecutive splits build streaks for bonus multipliers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Stats Sidebar */}
        <div className="space-y-6">
          {/* Current Streak */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-orange-400">
                  {mockGameState.playerStats.currentStreak}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Best Streak</span>
                    <span className="text-brand">{mockGameState.playerStats.bestStreak}</span>
                  </div>
                  <Progress 
                    value={(mockGameState.playerStats.currentStreak / mockGameState.playerStats.bestStreak) * 100} 
                    variant="gradient" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Stats */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brand" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Earned</span>
                  <span className="font-mono text-brand">
                    {formatNumber(mockGameState.playerStats.totalEarned)} $SPLIT
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Win Rate</span>
                  <span className="font-mono text-brand">
                    {mockGameState.playerStats.winRate}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Splits</span>
                  <span className="font-mono text-green-400">
                    {mockGameState.playerStats.splits}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Steals</span>
                  <span className="font-mono text-red-400">
                    {mockGameState.playerStats.steals}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <Badge variant="arcade" className="w-full justify-center">
                  {mockGameState.playerStats.reputation}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Trophy className="w-4 h-4 mr-2" />
                My Squads
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Coins className="w-4 h-4 mr-2" />
                Claim Rewards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

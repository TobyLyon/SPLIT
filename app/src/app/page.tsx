'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { PotMeter } from '@/components/game/pot-meter';
import { ChoicePanel } from '@/components/game/choice-panel';
import { LeaderboardTable } from '@/components/game/leaderboard-table';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { KPI } from '@/components/ui/kpi';
import { Badge } from '@/components/ui/badge';
import { Pill } from '@/components/ui/pill';
import { AnimatedAscii } from '@/components/ui/animated-ascii';
import { ClientAcquisition } from '@/components/onboarding/client-acquisition';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  useCommunityPot, 
  useCurrentDailyChoice, 
  useCurrentUserStats,
  useLeaderboard,
  useCommitChoice,
  useRevealChoice
} from '@/hooks/useDatabase';
import { 
  getCurrentDayUnix, 
  getTimeUntilNextPhase, 
  formatTimeRemaining,
  generateSalt,
  mockCommitChoice,
  mockRevealChoice,
  isFakeOnchainEnabled,
  Choice
} from '@/lib/choice';
import { Zap, Users, Trophy, Coins, Play } from 'lucide-react';

// Mock data for demonstration
const MOCK_LEADERBOARD = [
  {
    rank: 1,
    wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    handle: 'split_master',
    avatar: undefined,
    streak: 25,
    weight: 15000,
    pnl24h: 2500,
    winRate: 85,
    squadName: 'Alpha Squad',
    squadSync: 95,
    level: 'legend' as const,
    verified: true,
  },
  {
    rank: 2,
    wallet: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
    handle: 'steal_queen',
    streak: 18,
    weight: 12000,
    pnl24h: 1800,
    winRate: 78,
    squadName: 'Beta Squad',
    squadSync: 88,
    level: 'elite' as const,
    verified: true,
  },
  {
    rank: 3,
    wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    handle: 'crypto_ninja',
    streak: 15,
    weight: 9500,
    pnl24h: -500,
    winRate: 72,
    level: 'trusted' as const,
  },
];

export default function HomePage() {
  const { connected, publicKey } = useWallet();
  const [timeLeft, setTimeLeft] = useState('');
  const [currentPhase, setCurrentPhase] = useState<'commit' | 'reveal' | 'settled'>('commit');
  const [mounted, setMounted] = useState(false);

  // Data hooks
  const { data: potTotal = 0 } = useCommunityPot();
  const { data: dailyChoice } = useCurrentDailyChoice();
  const { data: userStats } = useCurrentUserStats();
  const { data: leaderboard = MOCK_LEADERBOARD } = useLeaderboard('streak');
  const commitChoice = useCommitChoice();
  const revealChoice = useRevealChoice();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!mounted) return;

    const updateTimer = () => {
      const { phase, timeLeft: ms } = getTimeUntilNextPhase();
      setCurrentPhase(phase);
      setTimeLeft(formatTimeRemaining(ms));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleCommit = async (choice: Choice, salt: string) => {
    if (!publicKey) return;
    
    const dayUnix = getCurrentDayUnix();
    
    if (isFakeOnchainEnabled()) {
      // Use mock implementation
      const saltBytes = new TextEncoder().encode(salt);
      const result = await mockCommitChoice(publicKey.toString(), dayUnix, choice, saltBytes);
      if (!result.success) {
        throw new Error(result.error);
      }
    } else {
      // Use real blockchain commit
      await commitChoice.mutateAsync({ dayUnix });
    }
  };

  const handleReveal = async (choice: Choice, salt: string) => {
    if (!publicKey) return;
    
    const dayUnix = getCurrentDayUnix();
    const choiceNum = choice === 'split' ? 0 : 1;
    
    if (isFakeOnchainEnabled()) {
      // Use mock implementation
      const saltBytes = new TextEncoder().encode(salt);
      const result = await mockRevealChoice(publicKey.toString(), dayUnix, choice, saltBytes);
      if (!result.success) {
        throw new Error(result.error);
      }
    } else {
      // Use real blockchain reveal
      await revealChoice.mutateAsync({ dayUnix, choice: choiceNum });
    }
  };

  const nextUnlockDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mock: 24h from now

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="section-padding pt-32 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="text-gradient">SPLIT</span>
              </h1>
              
              {/* ASCII Icons */}
              <div className="py-4">
                <AnimatedAscii 
                  size="lg" 
                  glow 
                  interval={2500}
                />
              </div>
              
              {/* Tagline */}
              <p className="text-lg md:text-xl text-ink-dim max-w-2xl mx-auto">
                The SocialFi staking game where every day you choose:
                <span className="text-brand font-bold"> Split </span>
                or
                <span className="text-accent font-bold"> Steal</span>
              </p>
            </motion.div>

            {/* Community Pot Hero - Compact */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg mx-auto"
            >
              <PotMeter
                current={potTotal || 125000}
                target={200000}
                nextUnlockAt={nextUnlockDate}
                variant="compact"
                animated={false}
                showCountdown={false}
                className="scale-90"
              />
            </motion.div>

            {/* CTA Button */}
            {!connected ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <WalletMultiButton className="glass-button text-lg px-8 py-4" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex justify-center"
              >
                <Button
                  size="lg"
                  className="bg-brand hover:bg-brand/90 text-bg font-bold px-8 py-4 text-lg"
                  onClick={() => {
                    // Scroll to choice panel
                    document.getElementById('daily-choice')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Join Today's Round
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Client Acquisition Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <ClientAcquisition />
        </div>
      </section>

      {/* Daily Choice Section */}
      {connected && (
        <section id="daily-choice" className="section-padding">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ChoicePanel
                dayUnix={getCurrentDayUnix()}
                hasCommitted={dailyChoice?.committed || false}
                hasRevealed={dailyChoice?.revealed || false}
                currentChoice={dailyChoice?.choice !== undefined ? (dailyChoice.choice === 0 ? 'split' : 'steal') : undefined}
                phase={currentPhase}
                timeLeft={timeLeft}
                onCommit={handleCommit}
                onReveal={handleReveal}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {connected && userStats && (
        <section className="section-padding">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Your Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <KPI
                    value={userStats.current_streak}
                    label="Current Streak"
                    variant="brand"
                    animated
                  />
                  <KPI
                    value={userStats.best_streak}
                    label="Best Streak"
                    variant="accent"
                    animated
                  />
                  <KPI
                    value={`${userStats.winrate}%`}
                    label="Win Rate"
                    variant="success"
                    animated
                  />
                  <KPI
                    value={userStats.rounds_joined}
                    label="Rounds Played"
                    variant="default"
                    animated
                  />
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>
      )}

      {/* Leaderboard Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Top Players</h2>
              <p className="text-ink-dim">See who's dominating the daily rounds</p>
            </div>
            
            <LeaderboardTable
              data={leaderboard}
              mode="streak"
              maxRows={10}
              variant="default"
            />
            
            <div className="text-center">
              <Button variant="outline" className="glass-button">
                View Full Leaderboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-ink-dim max-w-2xl mx-auto">
                Every day, choose your strategy. Build streaks, earn rewards, and compete with your squad.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <GlassCard className="p-8 text-center hover-lift" hover>
                <div className="w-16 h-16 mx-auto mb-6 bg-brand/20 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-brand" />
                </div>
                <h3 className="text-xl font-bold mb-4">Daily Choices</h3>
                <p className="text-ink-dim">
                  Commit your choice, then reveal it. Split to share, steal to take more risk.
                </p>
              </GlassCard>

              <GlassCard className="p-8 text-center hover-lift" hover>
                <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4">Squad Up</h3>
                <p className="text-ink-dim">
                  Join squads for coordinated strategies and bonus rewards when you sync up.
                </p>
              </GlassCard>

              <GlassCard className="p-8 text-center hover-lift" hover>
                <div className="w-16 h-16 mx-auto mb-6 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Build Streaks</h3>
                <p className="text-ink-dim">
                  Consecutive splits build powerful streaks with multipliers and reputation.
                </p>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
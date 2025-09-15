'use client';

import { motion } from 'framer-motion';
import { Trophy, Users, Crown, Coins, Sparkles, Medal, Flame } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { CrewLeaderboard } from '@/components/crews/crew-leaderboard';
import { KPI } from '@/components/ui/kpi';
import { Pill } from '@/components/ui/pill';
import { formatNumber } from '@/lib/utils';
import { MOCK_CREWS } from '@/lib/crews';

export default function LeaderboardPage() {
  const crews = MOCK_CREWS;

  // Calculate crew stats for the hero section
  const crewStats = {
    totalCrews: crews.length,
    totalMembers: crews.reduce((acc, crew) => acc + crew.stats.totalMembers, 0),
    topRating: Math.max(...crews.map(crew => crew.stats.crewRating)),
    totalEarnings: crews.reduce((acc, crew) => acc + crew.stats.totalEarnings, 0),
    bestStreak: Math.max(...crews.map(crew => crew.stats.bestStreak)),
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="section-padding pt-32 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Crown className="w-8 h-8 text-brand" />
              <h1 className="text-4xl md:text-6xl font-bold text-gradient">
                Crew Leaderboard
              </h1>
              <Crown className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xl md:text-2xl text-ink-dim max-w-3xl mx-auto">
              The most legendary crews in SPLIT. Form your gang, customize your identity, 
              and dominate the leaderboard together.
            </p>
          </motion.div>

          {/* Top Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <GlassCard className="p-4 text-center" hover>
              <KPI
                value={crewStats.totalCrews}
                label="Active Crews"
                icon={Users}
                variant="brand"
                size="sm"
                animated
              />
            </GlassCard>
            <GlassCard className="p-4 text-center" hover>
              <KPI
                value={crewStats.totalMembers}
                label="Total Members"
                icon={Sparkles}
                variant="accent"
                size="sm"
                animated
              />
            </GlassCard>
            <GlassCard className="p-4 text-center" hover>
              <KPI
                value={crewStats.topRating}
                label="Top Rating"
                icon={Trophy}
                variant="success"
                size="sm"
                animated
              />
            </GlassCard>
            <GlassCard className="p-4 text-center" hover>
              <KPI
                value={`$${formatNumber(crewStats.totalEarnings)}`}
                label="Total Earnings"
                icon={Coins}
                variant="warning"
                size="sm"
                animated
              />
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Crew Leaderboard Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <CrewLeaderboard
              crews={crews}
              showSearch
              showFilters
              variant="default"
            />
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-8 text-center" glow>
              <h3 className="text-3xl font-bold mb-4 text-gradient">
                Ready to Form Your Crew?
              </h3>
              <p className="text-xl text-ink-dim mb-8 max-w-2xl mx-auto">
                Join forces with other players, unlock exclusive customizations, and climb the ranks together. 
                The strongest crews earn the biggest rewards.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                <Pill variant="brand" size="lg" glow>
                  <Crown className="w-5 h-5 mr-2" />
                  Custom Icons & Banners
                </Pill>
                <Pill variant="accent" size="lg">
                  <Flame className="w-5 h-5 mr-2" />
                  Burn for Multipliers
                </Pill>
                <Pill variant="success" size="lg">
                  <Medal className="w-5 h-5 mr-2" />
                  Exclusive Rewards
                </Pill>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-ink-dim">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4 text-brand" />
                  <span>Up to 50 Members</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span>Rank Progression</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span>Legendary Unlocks</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowDown, 
  Users, 
  Coins, 
  Shield,
  Zap
} from 'lucide-react';
import { GameFlowPreview } from './game-flow-preview';
import { WidgetShowcase } from './widget-showcase';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { KPI } from '@/components/ui/kpi';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const GAME_STATS: StatCard[] = [
  {
    label: 'Active Players',
    value: '12.5K',
    icon: Users,
    trend: 'up',
    trendValue: '+23%'
  },
  {
    label: 'Total Pot Value',
    value: '$2.8M',
    icon: Coins,
    trend: 'up',
    trendValue: '+45%'
  },
  {
    label: 'Daily Rounds',
    value: '365',
    icon: Zap,
    trend: 'neutral'
  },
  {
    label: 'Security Score',
    value: '99.9%',
    icon: Shield,
    trend: 'up',
    trendValue: 'A+'
  }
];

export interface ClientAcquisitionProps {
  className?: string;
}

export function ClientAcquisition({ className }: ClientAcquisitionProps) {
  return (
    <div className={cn('space-y-24 py-16', className)}>
      {/* Introduction */}
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-brand" />
            <Badge variant="brand" size="lg" glow>
              New to SPLIT?
            </Badge>
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Learn the Game</span>
          </h2>
          <p className="text-xl md:text-2xl text-ink-dim max-w-3xl mx-auto mb-8">
            SPLIT is a daily social strategy game where cooperation and competition collide. 
            Every day, choose your strategy and see if you can outsmart the community.
          </p>
          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-brand animate-bounce" />
          </div>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GAME_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-4 text-center" hover>
                  <KPI
                    value={stat.value}
                    label={stat.label}
                    icon={stat.icon}
                    trend={stat.trend}
                    trendValue={stat.trendValue}
                    variant="brand"
                    size="sm"
                    animated
                  />
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Game Flow Preview */}
      <section>
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-ink mb-4">How to Play</h2>
            <p className="text-xl text-ink-dim max-w-2xl mx-auto">
              Follow the daily game cycle and learn when to cooperate or compete
            </p>
          </motion.div>
        </div>
        <GameFlowPreview autoPlay />
      </section>

      {/* Widget Showcase */}
      <section>
        <WidgetShowcase />
      </section>

      {/* Call to Action */}
      <section>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-12 text-center" glow>
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gradient">
                Ready to Start Playing?
              </h2>
              <p className="text-xl text-ink-dim">
                Connect your Solana wallet and join thousands of players in the ultimate 
                social strategy game. Your first game starts at the next daily reset.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-brand hover:bg-brand/90 text-bg font-bold">
                  <Zap className="w-5 h-5 mr-2" />
                  Connect Wallet & Play
                </Button>
                <Button variant="outline" size="lg" className="bg-glass hover:bg-glass-strong">
                  View Leaderboard
                </Button>
              </div>
              <div className="flex justify-center space-x-8 text-sm text-ink-dim">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Secure & Fair</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-brand" />
                  <span>12.5K+ Players</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span>$2.8M+ Pot</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}

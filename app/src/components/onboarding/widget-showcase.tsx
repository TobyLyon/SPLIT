'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Trophy, 
  Users, 
  Coins, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ChoicePanel } from '@/components/game/choice-panel';
import { PotMeter } from '@/components/game/pot-meter';
import { LeaderboardTable } from '@/components/game/leaderboard-table';
import { SquadSyncBar } from '@/components/game/squad-sync-bar';
import { AvatarRibbon } from '@/components/ui/avatar-ribbon';
import { cn } from '@/lib/utils';

interface WidgetDemo {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'gameplay' | 'social' | 'rewards';
  component: React.ReactNode;
}

// Mock data for demos
const mockLeaderboardData = [
  {
    rank: 1,
    wallet: 'ABC123...',
    handle: 'CryptoKing',
    streak: 15,
    weight: 50000,
    pnl24h: 2500,
    winRate: 85,
    squadName: 'Diamond Hands',
    level: 'elite' as const,
    verified: true
  },
  {
    rank: 2,
    wallet: 'DEF456...',
    handle: 'SplitMaster',
    streak: 12,
    weight: 45000,
    pnl24h: 1800,
    winRate: 78,
    squadName: 'Split Squad',
    level: 'trusted' as const,
    verified: false
  },
  {
    rank: 3,
    wallet: 'GHI789...',
    handle: 'StealLord',
    streak: 8,
    weight: 38000,
    pnl24h: -500,
    winRate: 72,
    squadName: 'Chaos Crew',
    level: 'trusted' as const,
    verified: true
  }
];

const WIDGET_DEMOS: WidgetDemo[] = [
  {
    id: 'choice-panel',
    title: 'Daily Choice Panel',
    description: 'The heart of the game - make your daily Split or Steal decision with our secure commit-reveal system.',
    icon: Play,
    category: 'gameplay',
    component: (
      <div className="max-w-md mx-auto">
        <ChoicePanel
          dayUnix={Math.floor(Date.now() / 1000)}
          hasCommitted={false}
          hasRevealed={false}
          phase="commit"
          timeLeft="08:42:15"
          disabled={false}
        />
      </div>
    )
  },
  {
    id: 'pot-meter',
    title: 'Community Pot',
    description: 'Track the growing community pot and see when the next unlock happens. Your choices determine who wins.',
    icon: Coins,
    category: 'rewards',
    component: (
      <div className="max-w-lg mx-auto">
        <PotMeter
          current={127500}
          target={200000}
          nextUnlockAt={new Date(Date.now() + 6 * 60 * 60 * 1000)}
          variant="default"
          animated
          showCountdown
        />
      </div>
    )
  },
  {
    id: 'leaderboard',
    title: 'Live Leaderboard',
    description: 'See how you rank against other players. Climb the ranks by building streaks and making smart choices.',
    icon: Trophy,
    category: 'social',
    component: (
      <div className="max-w-2xl mx-auto">
        <LeaderboardTable
          data={mockLeaderboardData}
          mode="weight"
          variant="compact"
          maxRows={3}
        />
      </div>
    )
  },
  {
    id: 'squad-sync',
    title: 'Squad Coordination',
    description: 'Join squads and coordinate with teammates. See who has committed and revealed their choices.',
    icon: Users,
    category: 'social',
    component: (
      <div className="max-w-md mx-auto">
        <SquadSyncBar
          total={5}
          committed={3}
          revealed={1}
          phase="commit"
          squadName="Diamond Hands"
          variant="default"
        />
      </div>
    )
  }
];

export interface WidgetShowcaseProps {
  className?: string;
}

export function WidgetShowcase({ className }: WidgetShowcaseProps) {
  const [currentWidget, setCurrentWidget] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gameplay' | 'social' | 'rewards'>('all');

  const filteredWidgets = selectedCategory === 'all' 
    ? WIDGET_DEMOS 
    : WIDGET_DEMOS.filter(widget => widget.category === selectedCategory);

  const currentDemo = filteredWidgets[currentWidget] || WIDGET_DEMOS[0];

  const nextWidget = () => {
    setCurrentWidget((prev) => (prev + 1) % filteredWidgets.length);
  };

  const prevWidget = () => {
    setCurrentWidget((prev) => (prev - 1 + filteredWidgets.length) % filteredWidgets.length);
  };

  const categories = [
    { id: 'all' as const, label: 'All Widgets', icon: Eye },
    { id: 'gameplay' as const, label: 'Gameplay', icon: Play },
    { id: 'social' as const, label: 'Social', icon: Users },
    { id: 'rewards' as const, label: 'Rewards', icon: Coins }
  ];

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gradient mb-4">Interactive Game Widgets</h2>
          <p className="text-xl text-ink-dim max-w-2xl mx-auto">
            Explore the key interfaces you'll use to play SPLIT. Click through to see how each widget works.
          </p>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="flex space-x-2 p-1 bg-glass rounded-2xl">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentWidget(0);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                selectedCategory === category.id
                  ? 'bg-brand text-bg shadow-brand-glow'
                  : 'text-ink-dim hover:text-ink hover:bg-white/10'
              )}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Widget Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <GlassCard className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Widget Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center">
                  <currentDemo.icon className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-ink">{currentDemo.title}</h3>
                  <span className={cn(
                    'text-sm px-2 py-1 rounded-lg',
                    currentDemo.category === 'gameplay' && 'bg-brand/20 text-brand',
                    currentDemo.category === 'social' && 'bg-accent/20 text-accent',
                    currentDemo.category === 'rewards' && 'bg-green-500/20 text-green-400'
                  )}>
                    {currentDemo.category}
                  </span>
                </div>
              </div>
              
              <p className="text-ink-dim text-lg leading-relaxed">
                {currentDemo.description}
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevWidget}
                  disabled={filteredWidgets.length <= 1}
                  className="bg-glass hover:bg-glass-strong"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {filteredWidgets.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentWidget(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        index === currentWidget
                          ? 'bg-brand w-6'
                          : 'bg-white/20 hover:bg-white/40'
                      )}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={nextWidget}
                  disabled={filteredWidgets.length <= 1}
                  className="bg-glass hover:bg-glass-strong"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Widget Demo */}
            <div className="lg:pl-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDemo.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentDemo.component}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Flame, 
  Coins,
  Filter,
  Search
} from 'lucide-react';
import { CrewCard } from './crew-card';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/utils';
import { Crew, MOCK_CREWS } from '@/lib/crews';

export type CrewLeaderboardMode = 'rating' | 'earnings' | 'winrate' | 'streak' | 'members';

interface CrewLeaderboardProps {
  crews?: Crew[];
  mode?: CrewLeaderboardMode;
  maxCrews?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const LEADERBOARD_MODES = [
  { id: 'rating' as const, label: 'Top Rated', icon: Trophy, description: 'Overall crew performance' },
  { id: 'earnings' as const, label: 'Highest Earnings', icon: Coins, description: 'Total crew earnings' },
  { id: 'winrate' as const, label: 'Win Rate', icon: TrendingUp, description: 'Best win percentage' },
  { id: 'streak' as const, label: 'Win Streak', icon: Flame, description: 'Current winning streak' },
  { id: 'members' as const, label: 'Most Active', icon: Users, description: 'Most active members' }
];

const CREW_TAGS = [
  'competitive', 'casual', 'high-stakes', 'crypto-native', 
  'aggressive', 'pvp', 'risk-takers', 'social', 'strategic'
];

export function CrewLeaderboard({ 
  crews = MOCK_CREWS,
  mode = 'rating',
  maxCrews = 20,
  showSearch = true,
  showFilters = true,
  variant = 'default',
  className 
}: CrewLeaderboardProps) {
  const [selectedMode, setSelectedMode] = useState<CrewLeaderboardMode>(mode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  // Sort crews based on selected mode
  const sortedCrews = React.useMemo(() => {
    let filtered = crews.filter(crew => {
      const matchesSearch = !searchQuery || 
        crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crew.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => crew.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    filtered.sort((a, b) => {
      switch (selectedMode) {
        case 'rating':
          return b.stats.crewRating - a.stats.crewRating;
        case 'earnings':
          return b.stats.totalEarnings - a.stats.totalEarnings;
        case 'winrate':
          const aWinRate = a.stats.totalWins / Math.max(a.stats.totalWins + a.stats.totalLosses, 1);
          const bWinRate = b.stats.totalWins / Math.max(b.stats.totalWins + b.stats.totalLosses, 1);
          return bWinRate - aWinRate;
        case 'streak':
          return b.stats.winStreak - a.stats.winStreak;
        case 'members':
          return b.stats.activeMembers - a.stats.activeMembers;
        default:
          return 0;
      }
    });

    return maxCrews ? filtered.slice(0, maxCrews) : filtered;
  }, [crews, selectedMode, searchQuery, selectedTags, maxCrews]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const currentModeInfo = LEADERBOARD_MODES.find(m => m.id === selectedMode);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gradient mb-4">Crew Leaderboard</h2>
          <p className="text-xl text-ink-dim max-w-2xl mx-auto">
            The most legendary crews in SPLIT. Form your gang, climb the ranks, and dominate the game.
          </p>
        </motion.div>
      </div>

      {/* Controls */}
      <GlassCard className="p-6">
        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold text-ink">Ranking Mode</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {LEADERBOARD_MODES.map((modeOption) => (
              <Button
                key={modeOption.id}
                variant={selectedMode === modeOption.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMode(modeOption.id)}
                className={cn(
                  'flex items-center space-x-2',
                  selectedMode === modeOption.id 
                    ? 'bg-brand text-bg shadow-brand-glow' 
                    : 'bg-glass hover:bg-glass-strong'
                )}
              >
                <modeOption.icon className="w-4 h-4" />
                <span>{modeOption.label}</span>
              </Button>
            ))}
          </div>
          {currentModeInfo && (
            <p className="text-sm text-ink-dim mt-2">{currentModeInfo.description}</p>
          )}
        </div>

        {/* Search and Filters */}
        {showSearch && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-dim" />
              <Input
                placeholder="Search crews by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-glass border-white/10"
              />
            </div>

            {/* Tag Filters */}
            {showFilters && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-ink-dim">Filter by Tags</h4>
                  {(selectedTags.length > 0 || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-ink-dim hover:text-ink"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {CREW_TAGS.slice(0, showAllTags ? undefined : 6).map((tag) => (
                    <Pill
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'brand' : 'neutral'}
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Pill>
                  ))}
                  {CREW_TAGS.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="text-ink-dim hover:text-ink"
                    >
                      {showAllTags ? 'Show Less' : `+${CREW_TAGS.length - 6} More`}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-ink-dim">
          Showing {sortedCrews.length} {sortedCrews.length === 1 ? 'crew' : 'crews'}
          {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
        </p>
        {currentModeInfo && (
          <Pill variant="brand" size="sm">
            <currentModeInfo.icon className="w-3 h-3 mr-1" />
            {currentModeInfo.label}
          </Pill>
        )}
      </div>

      {/* Crew Grid */}
      <AnimatePresence>
        {sortedCrews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Users className="w-12 h-12 text-ink-dim mx-auto mb-4" />
            <h3 className="text-xl font-bold text-ink mb-2">No Crews Found</h3>
            <p className="text-ink-dim">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <div className={cn(
            'grid gap-6',
            variant === 'compact' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 lg:grid-cols-2'
          )}>
            {sortedCrews.map((crew, index) => (
              <motion.div
                key={crew.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CrewCard
                  crew={crew}
                  rank={index + 1}
                  variant={variant}
                  showMembers={variant !== 'compact'}
                  animated={false} // Already animated by parent
                  onClick={() => {
                    // TODO: Navigate to crew detail page
                    console.log('View crew:', crew.id);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Crown, 
  Flame,
  Star,
  Shield,
  Zap
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Pill } from '@/components/ui/pill';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { AvatarRibbon } from '@/components/ui/avatar-ribbon';
import { cn, formatNumber } from '@/lib/utils';
import { Crew, getCrewRankName, getCrewRankColor } from '@/lib/crews';

export interface CrewCardProps {
  crew: Crew;
  rank?: number;
  variant?: 'default' | 'compact' | 'detailed';
  showMembers?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CrewCard({ 
  crew, 
  rank, 
  variant = 'default',
  showMembers = false,
  animated = true,
  onClick,
  className 
}: CrewCardProps) {
  const { stats, customization, members } = crew;
  const winRate = Math.round((stats.totalWins / Math.max(stats.totalWins + stats.totalLosses, 1)) * 100);
  const activityRate = Math.round((stats.activeMembers / stats.totalMembers) * 100);

  const Component = animated ? motion.div : 'div';
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: { y: -2, transition: { duration: 0.2 } },
    transition: { duration: 0.3 }
  } : {};

  const getBestMemberRank = () => {
    if (members.length === 0) return 'rookie';
    return members.reduce((best, member) => {
      const rankOrder = ['rookie', 'soldier', 'lieutenant', 'captain', 'boss'];
      const bestIndex = rankOrder.indexOf(best);
      const memberIndex = rankOrder.indexOf(member.rank);
      return memberIndex > bestIndex ? member.rank : best;
    }, 'rookie');
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'boss': return Crown;
      case 'captain': return Star;
      case 'lieutenant': return Shield;
      case 'soldier': return Zap;
      default: return Users;
    }
  };

  const bestRank = getBestMemberRank();
  const RankIcon = getRankIcon(bestRank);

  return (
    <Component
      className={cn(
        'cursor-pointer group',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      <GlassCard 
        className="p-6 h-full overflow-hidden relative"
        hover
        style={{
          borderColor: `${customization.primaryColor}20`,
          background: `linear-gradient(135deg, ${customization.primaryColor}08 0%, ${customization.accentColor}08 100%)`
        }}
      >
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-4 right-4">
            <Badge 
              variant={rank <= 3 ? 'brand' : 'default'} 
              size="md"
              className={rank === 1 ? 'shadow-brand-glow' : ''}
            >
              <Trophy className="w-4 h-4 mr-1" />
              #{rank}
            </Badge>
          </div>
        )}

        {/* Crew Header */}
        <div className="flex items-start space-x-4 mb-6">
          {/* Crew Icon */}
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg"
            style={{ 
              backgroundColor: customization.primaryColor + '20',
              color: customization.primaryColor,
              border: `2px solid ${customization.primaryColor}40`
            }}
          >
            {customization.icon === 'diamond-hands' ? '💎' : 
             customization.icon === 'skull-basic' ? '💀' :
             customization.icon === 'crown-gold' ? '👑' :
             customization.icon === 'dragon-fire' ? '🐉' :
             customization.icon === 'phoenix' ? '🔥🦅' : '⚡'}
          </div>

          {/* Crew Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-ink truncate">{crew.name}</h3>
              <Pill 
                variant="neutral" 
                size="sm"
                style={{ 
                  backgroundColor: getCrewRankColor(bestRank) + '20',
                  color: getCrewRankColor(bestRank)
                }}
              >
                <RankIcon className="w-3 h-3 mr-1" />
                {getCrewRankName(bestRank)}
              </Pill>
            </div>
            
            {customization.motto && (
              <p className="text-sm text-ink-dim italic mb-2">"{customization.motto}"</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-ink-dim" />
                <span className="text-ink-dim">
                  {stats.activeMembers}/{stats.totalMembers}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-ink">{stats.winStreak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-brand">
              {formatNumber(stats.totalEarnings)}
            </div>
            <p className="text-xs text-ink-dim">Total Earnings</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-ink">
              {winRate}%
            </div>
            <p className="text-xs text-ink-dim">Win Rate</p>
          </div>
        </div>

        {/* Activity Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-ink-dim">Activity</span>
            <span className="text-sm text-ink">{activityRate}%</span>
          </div>
          <ProgressGlow
            value={activityRate}
            variant={activityRate >= 80 ? 'brand' : activityRate >= 60 ? 'accent' : 'default'}
            size="sm"
            glow={activityRate >= 80}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {crew.tags.slice(0, 3).map((tag) => (
            <Pill key={tag} variant="neutral" size="sm">
              {tag}
            </Pill>
          ))}
        </div>

        {/* Members Preview */}
        {showMembers && members.length > 0 && (
          <div>
            <p className="text-sm text-ink-dim mb-2">Top Members</p>
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member, index) => (
                <div
                  key={member.wallet}
                  className="relative z-10"
                  style={{ zIndex: 10 - index }}
                >
                  <AvatarRibbon
                    src={member.avatar}
                    handle={member.handle}
                    size="sm"
                    level={member.rank === 'boss' ? 'legend' : member.rank === 'captain' ? 'elite' : 'trusted'}
                    showStats={false}
                    className="ring-2 ring-bg"
                  />
                </div>
              ))}
              {members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-glass border-2 border-bg flex items-center justify-center text-xs text-ink-dim">
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-4 right-4">
          <div 
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{
              backgroundColor: customization.accentColor + '20',
              color: customization.accentColor
            }}
          >
            {stats.crewRating}
          </div>
        </div>

        {/* Hover Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.accentColor} 100%)`
          }}
        />
      </GlassCard>
    </Component>
  );
}

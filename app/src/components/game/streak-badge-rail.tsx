import * as React from 'react';
import { motion } from 'framer-motion';
import { Flame, Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export interface StreakBadgeRailProps {
  streak: number;
  best: number;
  variant?: 'default' | 'compact' | 'detailed';
  animated?: boolean;
  showBest?: boolean;
  className?: string;
}

const StreakBadgeRail: React.FC<StreakBadgeRailProps> = ({
  streak,
  best,
  variant = 'default',
  animated = true,
  showBest = true,
  className,
}) => {
  // Define milestone thresholds
  const milestones = [1, 3, 5, 10, 15, 20, 25, 30, 50, 100];
  
  // Get the relevant milestones to show
  const getVisibleMilestones = () => {
    const maxStreak = Math.max(streak, best);
    const nextMilestone = milestones.find(m => m > maxStreak);
    
    // Show milestones up to current streak + next 2-3 milestones
    let visible = milestones.filter(m => m <= maxStreak);
    if (nextMilestone) {
      const nextIndex = milestones.indexOf(nextMilestone);
      visible = [...visible, ...milestones.slice(nextIndex, nextIndex + 3)];
    }
    
    return visible.slice(0, variant === 'compact' ? 5 : 8);
  };

  const visibleMilestones = getVisibleMilestones();

  const getMilestoneStatus = (milestone: number) => {
    if (milestone <= streak) return 'current';
    if (milestone <= best) return 'achieved';
    return 'locked';
  };

  const getMilestoneVariant = (milestone: number, status: string) => {
    if (status === 'current') {
      if (milestone >= 50) return 'warning'; // Gold
      if (milestone >= 20) return 'accent'; // Violet
      if (milestone >= 10) return 'success'; // Green
      return 'brand'; // Mint
    }
    if (status === 'achieved') return 'neutral';
    return 'default';
  };

  const getMilestoneIcon = (milestone: number) => {
    if (milestone >= 50) return Crown;
    if (milestone >= 20) return Star;
    if (milestone >= 10) return Flame;
    return null;
  };

  const variantStyles = {
    default: {
      container: 'p-4',
      title: 'text-lg font-bold mb-4',
      rail: 'flex items-center space-x-2 overflow-x-auto pb-2',
      badge: 'md',
    },
    compact: {
      container: 'p-3',
      title: 'text-base font-bold mb-3',
      rail: 'flex items-center space-x-1 overflow-x-auto pb-1',
      badge: 'sm',
    },
    detailed: {
      container: 'p-6',
      title: 'text-xl font-bold mb-6',
      rail: 'flex items-center space-x-3 overflow-x-auto pb-3',
      badge: 'lg',
    },
  };

  const styles = variantStyles[variant];

  return (
    <GlassCard className={cn(styles.container, className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className={cn(styles.title, 'flex items-center space-x-2')}>
            <Flame className="w-5 h-5 text-brand" />
            <span>Streak Progress</span>
          </h3>
          
          {showBest && best > 0 && (
            <div className="text-sm text-ink-dim">
              Best: <span className="font-mono text-accent">{best}</span>
            </div>
          )}
        </div>

        {/* Current Streak Display */}
        {variant !== 'compact' && (
          <div className="text-center">
            <Badge
              streak={streak}
              size={variant === 'detailed' ? 'lg' : 'md'}
              glow={streak >= 10}
              animated={animated}
            />
          </div>
        )}

        {/* Milestone Rail */}
        <div className={styles.rail}>
          {visibleMilestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            const variant = getMilestoneVariant(milestone, status);
            const Icon = getMilestoneIcon(milestone);
            const isActive = milestone === streak;
            const isAchieved = milestone <= best;

            return (
              <motion.div
                key={milestone}
                initial={animated ? { scale: 0, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: animated ? index * 0.1 : 0,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25
                }}
                className="relative flex flex-col items-center min-w-fit"
              >
                {/* Connecting Line */}
                {index > 0 && (
                  <div className={cn(
                    'absolute -left-2 top-1/2 w-4 h-0.5 -translate-y-1/2 z-0',
                    status === 'current' || isAchieved 
                      ? 'bg-brand/50' 
                      : 'bg-ink-dim/20'
                  )} />
                )}

                {/* Milestone Badge */}
                <div className={cn(
                  'relative z-10 flex flex-col items-center space-y-1',
                  isActive && 'animate-pulse-glow'
                )}>
                  <Badge
                    variant={variant}
                    size={styles.badge}
                    glow={isActive || (milestone >= 20 && status === 'current')}
                    animated={animated && isActive}
                    className={cn(
                      'font-mono tabular-nums',
                      status === 'locked' && 'opacity-50',
                      isActive && 'ring-2 ring-brand/50 ring-offset-2 ring-offset-bg'
                    )}
                  >
                    <div className="flex items-center space-x-1">
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{milestone}</span>
                    </div>
                  </Badge>

                  {/* Status Indicator */}
                  {variant === 'detailed' && (
                    <div className="text-xs text-center">
                      {isActive && <div className="text-brand font-medium">Current</div>}
                      {!isActive && isAchieved && <div className="text-ink-dim">✓</div>}
                      {status === 'locked' && <div className="text-ink-dim opacity-50">—</div>}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Next Milestone Indicator */}
          {streak > 0 && (
            <motion.div
              initial={animated ? { x: 20, opacity: 0 } : {}}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-2 text-ink-dim text-sm ml-4"
            >
              <div className="w-2 h-2 bg-ink-dim/30 rounded-full" />
              <span>Keep going!</span>
            </motion.div>
          )}
        </div>

        {/* Progress Description */}
        {variant !== 'compact' && (
          <div className="text-xs text-ink-dim text-center opacity-75">
            {streak === 0 
              ? 'Start your streak by making daily choices'
              : streak < 5
              ? 'Build momentum with consistent choices'
              : streak < 10
              ? 'You\'re on fire! Keep the streak alive'
              : streak < 20
              ? 'Incredible dedication! Elite status unlocked'
              : 'Legendary streak! You\'re in the hall of fame'
            }
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export { StreakBadgeRail };
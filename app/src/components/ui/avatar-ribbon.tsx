import * as React from 'react';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Pill } from './pill';
import { cn } from '@/lib/utils';

export interface AvatarRibbonProps {
  src?: string;
  alt?: string;
  handle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  streak?: number;
  winRate?: number;
  level?: 'newcomer' | 'trusted' | 'elite' | 'legend';
  verified?: boolean;
  showStats?: boolean;
  animated?: boolean;
  className?: string;
}

const AvatarRibbon: React.FC<AvatarRibbonProps> = ({
  src,
  alt = 'User avatar',
  handle,
  size = 'md',
  streak = 0,
  winRate = 0,
  level = 'newcomer',
  verified = false,
  showStats = true,
  animated = true,
  className,
}) => {
  const sizeClasses = {
    sm: {
      avatar: 'w-10 h-10',
      container: 'gap-2',
      stats: 'gap-1',
    },
    md: {
      avatar: 'w-12 h-12',
      container: 'gap-3',
      stats: 'gap-1.5',
    },
    lg: {
      avatar: 'w-16 h-16',
      container: 'gap-4',
      stats: 'gap-2',
    },
    xl: {
      avatar: 'w-20 h-20',
      container: 'gap-4',
      stats: 'gap-2',
    },
  };

  const badgeSize = size === 'sm' ? 'sm' : 'md';
  const pillSize = size === 'sm' ? 'sm' : size === 'xl' ? 'md' : 'sm';

  const Component = animated ? motion.div : 'div';
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  // Generate avatar URL if not provided
  const avatarSrc = src || `https://api.dicebear.com/7.x/identicon/svg?seed=${handle || 'user'}`;

  return (
    <Component
      className={cn('flex items-center', sizeClasses[size].container, className)}
      {...motionProps}
    >
      {/* Avatar with level ring */}
      <div className="relative">
        <div className={cn(
          'relative rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-bg transition-all duration-200',
          sizeClasses[size].avatar,
          getLevelRingColor(level)
        )}>
          <img
            src={avatarSrc}
            alt={alt}
            className="w-full h-full object-cover"
          />
          
          {/* Verified badge */}
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-bg">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Level badge */}
        <div className="absolute -top-1 -right-1">
          <Badge
            level={level}
            size={badgeSize}
            glow={level === 'legend' || level === 'elite'}
            animated={animated}
          />
        </div>
      </div>

      {/* Stats ribbon */}
      {showStats && (
        <div className={cn('flex flex-wrap items-center', sizeClasses[size].stats)}>
          {/* Streak */}
          {streak > 0 && (
            <Pill
              variant={getStreakVariant(streak)}
              size={pillSize}
              glow={streak >= 10}
              pulse={streak >= 20}
            >
              🔥 {streak}
            </Pill>
          )}
          
          {/* Win Rate */}
          {winRate > 0 && (
            <Pill
              variant={getWinRateVariant(winRate)}
              size={pillSize}
            >
              {winRate}% WR
            </Pill>
          )}
          
          {/* Handle */}
          {handle && (
            <Pill
              variant="neutral"
              size={pillSize}
            >
              @{handle}
            </Pill>
          )}
        </div>
      )}
    </Component>
  );
};

// Helper functions
function getLevelRingColor(level: string): string {
  switch (level) {
    case 'legend': return 'ring-yellow-400/50';
    case 'elite': return 'ring-accent/50';
    case 'trusted': return 'ring-brand/50';
    case 'newcomer': return 'ring-ink-dim/30';
    default: return 'ring-ink-dim/30';
  }
}

function getStreakVariant(streak: number): 'success' | 'warning' | 'brand' | 'neutral' {
  if (streak >= 20) return 'warning'; // gold
  if (streak >= 10) return 'success'; // green
  if (streak >= 5) return 'brand'; // mint
  return 'neutral';
}

function getWinRateVariant(winRate: number): 'success' | 'brand' | 'warning' | 'neutral' {
  if (winRate >= 80) return 'success';
  if (winRate >= 60) return 'brand';
  if (winRate >= 40) return 'warning';
  return 'neutral';
}

export { AvatarRibbon };
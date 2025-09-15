import * as React from 'react';
import { motion } from 'framer-motion';
import { Flame, Crown, Star, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'streak';
  size?: 'sm' | 'md' | 'lg';
  streak?: number;
  level?: 'newcomer' | 'trusted' | 'elite' | 'legend';
  animated?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    streak,
    level,
    animated = false,
    glow = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-glass border border-white/20 text-ink backdrop-blur-lg',
      brand: 'bg-brand/20 border border-brand/30 text-brand backdrop-blur-lg',
      accent: 'bg-accent/20 border border-accent/30 text-accent backdrop-blur-lg',
      success: 'bg-green-400/20 border border-green-400/30 text-green-400 backdrop-blur-lg',
      warning: 'bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 backdrop-blur-lg',
      danger: 'bg-red-400/20 border border-red-400/30 text-red-400 backdrop-blur-lg',
      streak: getStreakVariant(streak || 0),
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs min-w-[24px] h-6',
      md: 'px-3 py-1.5 text-sm min-w-[32px] h-8',
      lg: 'px-4 py-2 text-base min-w-[40px] h-10',
    };

    const levelConfig = {
      newcomer: { icon: User, color: 'text-ink-dim', bg: 'bg-ink-dim/20 border-ink-dim/30' },
      trusted: { icon: Shield, color: 'text-brand', bg: 'bg-brand/20 border-brand/30' },
      elite: { icon: Star, color: 'text-accent', bg: 'bg-accent/20 border-accent/30' },
      legend: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/20 border-yellow-400/30' },
    };

    // Determine content and styling
    let content: React.ReactNode = children;
    let finalVariant = variant;
    let iconElement: React.ReactNode = null;

    if (streak !== undefined) {
      finalVariant = 'streak';
      const streakLevel = getStreakLevel(streak);
      iconElement = <Flame className={cn('w-3 h-3 mr-1', getStreakColor(streak))} />;
      content = (
        <div className="flex items-center">
          {iconElement}
          <span className="font-mono tabular-nums">{streak}</span>
        </div>
      );
    } else if (level) {
      const config = levelConfig[level];
      const Icon = config.icon;
      iconElement = <Icon className="w-3 h-3 mr-1" />;
      finalVariant = 'default';
      content = (
        <div className="flex items-center">
          {iconElement}
          <span className="capitalize">{level}</span>
        </div>
      );
    }

    const Component = animated ? motion.div : 'div';
    const motionProps = animated ? {
      initial: { scale: 0 },
      animate: { scale: 1 },
      transition: { type: 'spring', stiffness: 500, damping: 25 }
    } : {};

    return (
      <Component
        className={cn(
          baseClasses,
          variantClasses[finalVariant],
          sizeClasses[size],
          level && levelConfig[level].bg,
          level && levelConfig[level].color,
          glow && getGlowClass(finalVariant, level, streak),
          className
        )}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {content}
      </Component>
    );
  }
);

Badge.displayName = 'Badge';

// Helper functions
function getStreakLevel(streak: number): 'low' | 'medium' | 'high' | 'epic' {
  if (streak >= 20) return 'epic';
  if (streak >= 10) return 'high';
  if (streak >= 5) return 'medium';
  return 'low';
}

function getStreakColor(streak: number): string {
  const level = getStreakLevel(streak);
  switch (level) {
    case 'epic': return 'text-yellow-400';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-brand';
    case 'low': return 'text-ink-dim';
  }
}

function getStreakVariant(streak: number): string {
  const level = getStreakLevel(streak);
  switch (level) {
    case 'epic': return 'bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 backdrop-blur-lg';
    case 'high': return 'bg-orange-400/20 border border-orange-400/40 text-orange-400 backdrop-blur-lg';
    case 'medium': return 'bg-brand/20 border border-brand/40 text-brand backdrop-blur-lg';
    case 'low': return 'bg-ink-dim/20 border border-ink-dim/30 text-ink-dim backdrop-blur-lg';
  }
}

function getGlowClass(variant: string, level?: string, streak?: number): string {
  if (streak !== undefined) {
    const streakLevel = getStreakLevel(streak);
    switch (streakLevel) {
      case 'epic': return 'shadow-[0_0_20px_rgba(250,204,21,0.4)]';
      case 'high': return 'shadow-[0_0_20px_rgba(251,146,60,0.4)]';
      case 'medium': return 'shadow-brand-glow';
      default: return '';
    }
  }
  
  if (level) {
    switch (level) {
      case 'legend': return 'shadow-[0_0_20px_rgba(250,204,21,0.4)]';
      case 'elite': return 'shadow-accent-glow';
      case 'trusted': return 'shadow-brand-glow';
      default: return '';
    }
  }
  
  switch (variant) {
    case 'brand': return 'shadow-brand-glow';
    case 'accent': return 'shadow-accent-glow';
    default: return '';
  }
}

export { Badge };
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Clock, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { KPI } from '@/components/ui/kpi';
import { Pill } from '@/components/ui/pill';
import { cn, formatNumber } from '@/lib/utils';

export interface PotMeterProps {
  current: number;
  target: number;
  nextUnlockAt?: Date;
  variant?: 'default' | 'hero' | 'compact';
  animated?: boolean;
  showCountdown?: boolean;
  className?: string;
}

const PotMeter: React.FC<PotMeterProps> = ({
  current,
  target,
  nextUnlockAt,
  variant = 'default',
  animated = true,
  showCountdown = true,
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!nextUnlockAt || !showCountdown || !mounted) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = nextUnlockAt.getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('UNLOCKED!');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextUnlockAt, showCountdown, mounted]);

  const percentage = Math.min((current / target) * 100, 100);
  const isUnlocked = current >= target;

  const variantStyles = {
    default: {
      container: 'p-6',
      title: 'text-xl font-bold mb-4',
      layout: 'space-y-4',
    },
    hero: {
      container: 'p-8',
      title: 'text-3xl font-bold mb-6',
      layout: 'space-y-6',
    },
    compact: {
      container: 'p-4',
      title: 'text-lg font-bold mb-3',
      layout: 'space-y-3',
    },
  };

  const styles = variantStyles[variant];

  return (
    <GlassCard
      className={cn(styles.container, className)}
      hover={variant !== 'hero'}
      glow={isUnlocked}
    >
      <div className={styles.layout}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={isUnlocked ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: isUnlocked ? Infinity : 0, repeatDelay: 2 }}
            >
              <Coins className={cn(
                'w-8 h-8',
                variant === 'hero' ? 'w-10 h-10' : 'w-6 h-6',
                isUnlocked ? 'text-yellow-400' : 'text-brand'
              )} />
            </motion.div>
            <h2 className={cn(styles.title, isUnlocked ? 'text-yellow-400' : 'text-brand')}>
              Community Pot
            </h2>
          </div>
          
          {isUnlocked && (
            <Pill variant="warning" glow pulse>
              UNLOCKED!
            </Pill>
          )}
        </div>

        {/* Main KPI */}
        <div className="text-center">
          <KPI
            value={formatNumber(current)}
            label="$SPLIT Available"
            variant={isUnlocked ? 'warning' : 'brand'}
            size={variant === 'hero' ? 'lg' : 'md'}
            animated={animated}
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <ProgressGlow
            value={current}
            max={target}
            variant={isUnlocked ? 'warning' : 'brand'}
            size={variant === 'compact' ? 'sm' : 'md'}
            animated={animated}
            glow={isUnlocked}
            pulse={isUnlocked}
          />
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-ink-dim">
              {formatNumber(current)} / {formatNumber(target)}
            </span>
            <span className="text-ink font-mono">
              {percentage.toFixed(1)}% filled
            </span>
          </div>
        </div>

        {/* Countdown or Status */}
        {showCountdown && nextUnlockAt && mounted && (
          <div className="flex items-center justify-center space-x-2 p-3 glass rounded-xl">
            {!isUnlocked ? (
              <>
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm text-ink-dim">Next unlock in</span>
                <span className="font-mono text-accent font-bold">
                  {timeLeft}
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Ready to claim!
                </span>
              </>
            )}
          </div>
        )}

        {/* Info tooltip */}
        <div className="text-xs text-ink-dim text-center opacity-75">
          Filled by double-steal slashes + fees
        </div>
      </div>
    </GlassCard>
  );
};

export { PotMeter };
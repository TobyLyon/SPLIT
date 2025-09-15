'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { cn, formatNumber } from '@/lib/utils';

export interface HeaderPotWidgetProps {
  current: number;
  target: number;
  nextUnlockAt?: Date;
  className?: string;
}

export function HeaderPotWidget({ 
  current, 
  target, 
  nextUnlockAt,
  className 
}: HeaderPotWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const progress = Math.min((current / target) * 100, 100);

  // Update countdown
  React.useEffect(() => {
    if (!nextUnlockAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = nextUnlockAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextUnlockAt]);

  const handleMouseDown = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsExpanded(true);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsExpanded(false);
  }, []);

  return (
    <motion.div
      className={cn('relative', className)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Compact View - Always visible */}
      <GlassCard 
        className={cn(
          'px-4 py-2 cursor-pointer transition-all duration-300 select-none relative z-10',
          isExpanded && 'shadow-brand-glow'
        )}
        variant="strong"
      >
        <div className="flex items-center space-x-3">
          <Coins className="w-4 h-4 text-brand" />
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono font-bold text-ink">
              ${formatNumber(current)}
            </span>
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs text-ink-dim font-mono">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Expanded View - Dropdown positioned below */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1 z-20"
            style={{ transformOrigin: 'top center' }}
          >
            <GlassCard className="p-3" variant="strong">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-dim">Target:</span>
                  <span className="font-mono text-ink">${formatNumber(target)}</span>
                </div>
                
                {nextUnlockAt && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-accent" />
                      <span className="text-ink-dim">Next unlock:</span>
                    </div>
                    <span className="font-mono text-accent">{timeLeft}</span>
                  </div>
                )}
                
                <div className="text-xs text-ink-dim text-center mt-2 opacity-60">
                  Hold to view details
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

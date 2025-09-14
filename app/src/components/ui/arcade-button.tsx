'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface ArcadeButtonProps extends ButtonProps {
  glowEffect?: boolean;
  pulseOnHover?: boolean;
  arcadeSound?: boolean;
}

export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ 
    className, 
    children, 
    glowEffect = false, 
    pulseOnHover = false,
    arcadeSound = false,
    ...props 
  }, ref) => {
    
    const playArcadeSound = () => {
      if (arcadeSound && typeof window !== 'undefined') {
        // Create a subtle beep sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
          // Fail silently if audio context is not available
        }
      }
    };

    return (
      <motion.div
        whileHover={pulseOnHover ? { scale: 1.05 } : {}}
        whileTap={{ scale: 0.98 }}
        className={cn(
          glowEffect && 'hover:glow-mint transition-all duration-300',
          'inline-block'
        )}
      >
        <Button
          ref={ref}
          className={cn(
            'relative overflow-hidden',
            'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
            'before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
            className
          )}
          onClick={(e) => {
            playArcadeSound();
            props.onClick?.(e);
          }}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

ArcadeButton.displayName = 'ArcadeButton';

// Special arcade-style number counter
export function ArcadeCounter({ 
  value, 
  duration = 2000, 
  className 
}: { 
  value: number; 
  duration?: number; 
  className?: string; 
}) {
  return (
    <motion.span
      className={cn('font-mono font-bold tabular-nums', className)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

// Arcade-style progress bar with neon effects
export function ArcadeProgress({ 
  value, 
  className,
  showGlow = false 
}: { 
  value: number; 
  className?: string; 
  showGlow?: boolean;
}) {
  return (
    <div className={cn('relative h-3 bg-white/5 rounded-full overflow-hidden', className)}>
      <motion.div
        className={cn(
          'h-full bg-gradient-to-r from-brand-mint to-brand-violet rounded-full',
          showGlow && 'glow-mint'
        )}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      
      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'linear',
        }}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
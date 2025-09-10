'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'mint' | 'violet' | 'dual';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'mint', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    mint: 'border-brand-mint border-t-transparent',
    violet: 'border-brand-violet border-t-transparent',
    dual: 'border-transparent',
  };

  if (variant === 'dual') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full border-2',
            'border-transparent border-t-brand-mint border-r-brand-violet'
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'rounded-full border-2',
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// Arcade-style loading dots
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-brand-mint"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Pulsing arcade loader
export function PulseLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'w-16 h-16 rounded-full',
        'bg-gradient-to-r from-brand-mint to-brand-violet',
        'opacity-20',
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showValue?: boolean;
  glow?: boolean;
  pulse?: boolean;
}

const ProgressGlow = React.forwardRef<HTMLDivElement, ProgressGlowProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    variant = 'brand', 
    size = 'md', 
    animated = true,
    showValue = false,
    glow = true,
    pulse = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    const variantClasses = {
      default: {
        bg: 'bg-glass',
        fill: 'bg-ink',
        glow: 'shadow-[0_0_15px_rgba(234,247,245,0.4)]',
      },
      brand: {
        bg: 'bg-brand-900/20',
        fill: 'bg-brand',
        glow: 'shadow-brand-glow',
      },
      accent: {
        bg: 'bg-accent-900/20',
        fill: 'bg-accent',
        glow: 'shadow-accent-glow',
      },
      success: {
        bg: 'bg-green-900/20',
        fill: 'bg-green-400',
        glow: 'shadow-[0_0_20px_rgba(74,222,128,0.4)]',
      },
      warning: {
        bg: 'bg-yellow-900/20',
        fill: 'bg-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(250,204,21,0.4)]',
      },
      danger: {
        bg: 'bg-red-900/20',
        fill: 'bg-red-400',
        glow: 'shadow-[0_0_20px_rgba(248,113,113,0.4)]',
      },
    };

    return (
      <div
        className={cn('relative w-full', className)}
        ref={ref}
        {...props}
      >
        {showValue && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-ink-dim">Progress</span>
            <span className="text-sm font-mono text-ink">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        
        <div className={cn(
          'relative overflow-hidden rounded-full backdrop-blur-sm',
          sizeClasses[size],
          variantClasses[variant].bg
        )}>
          <motion.div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              variantClasses[variant].fill,
              glow && variantClasses[variant].glow,
              pulse && 'animate-pulse-glow'
            )}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={animated ? { 
              type: 'spring', 
              stiffness: 100, 
              damping: 20,
              duration: 1
            } : undefined}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut'
            }}
            style={{
              width: '50%',
            }}
          />
        </div>
      </div>
    );
  }
);

ProgressGlow.displayName = 'ProgressGlow';

export { ProgressGlow };
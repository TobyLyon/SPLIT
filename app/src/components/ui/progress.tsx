import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showValue?: boolean;
  glow?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'brand', size = 'md', animated = true, showValue = false, glow = false, ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-ink-dim',
    brand: 'bg-brand shadow-brand-glow',
    accent: 'bg-accent shadow-accent-glow',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    danger: 'bg-red-400',
  };

  const progressValue = value ?? 0;

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-glass border border-white/10',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {animated ? (
          <motion.div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              variantClasses[variant],
              glow && 'animate-glow'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ) : (
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-500 ease-out rounded-full',
              variantClasses[variant],
              glow && 'animate-glow'
            )}
            style={{ transform: `translateX(-${100 - progressValue}%)` }}
          />
        )}
      </ProgressPrimitive.Root>
      
      {showValue && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-ink-dim">Progress</span>
          <span className="text-xs font-mono text-ink">{Math.round(progressValue)}%</span>
        </div>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };

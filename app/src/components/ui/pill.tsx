import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    glow = false, 
    pulse = false, 
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
      neutral: 'bg-ink-dim/20 border border-ink-dim/30 text-ink-dim backdrop-blur-lg',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const glowClasses = {
      default: '',
      brand: glow ? 'shadow-brand-glow' : '',
      accent: glow ? 'shadow-accent-glow' : '',
      success: glow ? 'shadow-[0_0_20px_rgba(74,222,128,0.3)]' : '',
      warning: glow ? 'shadow-[0_0_20px_rgba(250,204,21,0.3)]' : '',
      danger: glow ? 'shadow-[0_0_20px_rgba(248,113,113,0.3)]' : '',
      neutral: '',
    };

    const Component = pulse ? motion.div : 'div';
    const motionProps = pulse ? {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    } : {};

    return (
      <Component
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          glowClasses[variant],
          pulse && 'animate-pulse-glow',
          className
        )}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Pill.displayName = 'Pill';

export { Pill };
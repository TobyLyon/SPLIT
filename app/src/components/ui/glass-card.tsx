import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = false, glow = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-2xl border transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-glass backdrop-blur-xl border-white/10 shadow-glass',
      strong: 'bg-glass-strong backdrop-blur-xl border-white/20 shadow-glass',
      subtle: 'bg-white/4 backdrop-blur-lg border-white/5 shadow-glass-sm',
    };

    const Component = hover ? motion.div : 'div';
    const motionProps = hover ? {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    } : {};

    return (
      <Component
        className={cn(
          baseClasses,
          variantClasses[variant],
          hover && 'cursor-pointer hover:shadow-lg',
          glow && 'animate-glow',
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

GlassCard.displayName = 'GlassCard';

export { GlassCard };
import * as React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Choice = 'split' | 'steal';

export interface ChoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  choice: Choice;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
  glow?: boolean;
}

const ChoiceButton = React.forwardRef<HTMLButtonElement, ChoiceButtonProps>(
  ({ 
    className, 
    choice, 
    selected = false,
    size = 'md', 
    showIcon = true,
    showLabel = true,
    animated = true,
    glow = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const choiceConfig = {
      split: {
        icon: Shield,
        label: 'SPLIT',
        description: 'Share the rewards',
        color: 'brand',
        bgSelected: 'bg-brand/20 border-brand/50',
        bgDefault: 'bg-glass border-white/10 hover:border-brand/30',
        textSelected: 'text-brand',
        textDefault: 'text-ink hover:text-brand',
        glow: 'shadow-brand-glow',
      },
      steal: {
        icon: Zap,
        label: 'STEAL',
        description: 'Take the boost',
        color: 'accent',
        bgSelected: 'bg-accent/20 border-accent/50',
        bgDefault: 'bg-glass border-white/10 hover:border-accent/30',
        textSelected: 'text-accent',
        textDefault: 'text-ink hover:text-accent',
        glow: 'shadow-accent-glow',
      },
    };

    const config = choiceConfig[choice];
    const Icon = config.icon;

    const sizeClasses = {
      sm: {
        button: 'px-4 py-3 min-h-[60px]',
        icon: 'w-5 h-5',
        label: 'text-sm font-bold',
        description: 'text-xs',
      },
      md: {
        button: 'px-6 py-4 min-h-[80px]',
        icon: 'w-6 h-6',
        label: 'text-base font-bold',
        description: 'text-sm',
      },
      lg: {
        button: 'px-8 py-6 min-h-[120px]',
        icon: 'w-8 h-8',
        label: 'text-xl font-bold',
        description: 'text-base',
      },
    };

    const Component = animated ? motion.button : 'button';
    const motionProps = animated ? {
      whileHover: disabled ? {} : { scale: 1.05, y: -2 },
      whileTap: disabled ? {} : { scale: 0.95 },
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    } : {};

    return (
      <Component
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border backdrop-blur-xl font-medium transition-all duration-200 focus-brand',
          sizeClasses[size].button,
          selected ? config.bgSelected : config.bgDefault,
          selected ? config.textSelected : config.textDefault,
          selected && glow && config.glow,
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:shadow-lg active:shadow-sm',
          className
        )}
        ref={ref}
        disabled={disabled}
        {...motionProps}
        {...props}
      >
        {/* Glow effect background */}
        {selected && glow && (
          <div className={cn(
            'absolute inset-0 rounded-2xl opacity-20 animate-pulse-glow',
            choice === 'split' ? 'bg-brand' : 'bg-accent'
          )} />
        )}
        
        <div className="relative z-10 flex flex-col items-center space-y-2">
          {showIcon && (
            <Icon className={cn(sizeClasses[size].icon)} />
          )}
          
          {showLabel && (
            <div className="text-center">
              <div className={cn(sizeClasses[size].label)}>
                {config.label}
              </div>
              <div className={cn(
                'opacity-75',
                sizeClasses[size].description,
                selected ? config.textSelected : 'text-ink-dim'
              )}>
                {config.description}
              </div>
            </div>
          )}
          
          {children}
        </div>
      </Component>
    );
  }
);

ChoiceButton.displayName = 'ChoiceButton';

export { ChoiceButton };
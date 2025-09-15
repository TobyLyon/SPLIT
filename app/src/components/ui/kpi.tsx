import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPIProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const KPI: React.FC<KPIProps> = ({
  value,
  label,
  trend,
  trendValue,
  icon: Icon,
  variant = 'default',
  size = 'md',
  animated = true,
  className,
}) => {
  const variantClasses = {
    default: 'text-ink',
    brand: 'text-brand',
    accent: 'text-accent',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  const sizeClasses = {
    sm: {
      value: 'text-lg font-bold',
      label: 'text-xs',
      icon: 'w-4 h-4',
    },
    md: {
      value: 'text-2xl font-bold',
      label: 'text-sm',
      icon: 'w-5 h-5',
    },
    lg: {
      value: 'text-4xl font-bold',
      label: 'text-base',
      icon: 'w-6 h-6',
    },
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      case 'neutral':
        return <Minus className="w-3 h-3 text-ink-dim" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'neutral':
        return 'text-ink-dim';
      default:
        return 'text-ink-dim';
    }
  };

  const Component = animated ? motion.div : 'div';
  const motionProps = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  } : {};

  return (
    <Component
      className={cn('flex flex-col space-y-1', className)}
      {...motionProps}
    >
      <div className="flex items-center space-x-2">
        {Icon && (
          <Icon className={cn(sizeClasses[size].icon, variantClasses[variant])} />
        )}
        <div className={cn('font-mono tabular-nums', sizeClasses[size].value, variantClasses[variant])}>
          {value}
        </div>
        {trend && trendValue && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={cn('text-xs font-medium', getTrendColor())}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className={cn('font-medium text-ink-dim', sizeClasses[size].label)}>
        {label}
      </div>
    </Component>
  );
};

export { KPI };
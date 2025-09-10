import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'mint' | 'violet' | 'gradient';
  }
>(({ className, value, variant = 'default', ...props }, ref) => {
  const indicatorVariants = {
    default: 'bg-primary',
    mint: 'bg-brand-mint glow-mint',
    violet: 'bg-brand-violet glow-violet',
    gradient: 'bg-gradient-to-r from-brand-mint to-brand-violet',
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary/20 glass',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 transition-all duration-500 ease-out',
          indicatorVariants[variant]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
import * as React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Lock, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/utils';

export interface SquadSyncBarProps {
  total: number;
  committed: number;
  revealed: number;
  phase?: 'commit' | 'reveal' | 'settled';
  squadName?: string;
  variant?: 'default' | 'compact';
  animated?: boolean;
  className?: string;
}

const SquadSyncBar: React.FC<SquadSyncBarProps> = ({
  total,
  committed,
  revealed,
  phase = 'commit',
  squadName,
  variant = 'default',
  animated = true,
  className,
}) => {
  const commitPercentage = total > 0 ? (committed / total) * 100 : 0;
  const revealPercentage = total > 0 ? (revealed / total) * 100 : 0;
  
  const isFullyCommitted = committed === total && total > 0;
  const isFullyRevealed = revealed === total && total > 0;
  const isFullySynced = isFullyCommitted && isFullyRevealed;

  const getPhaseConfig = () => {
    switch (phase) {
      case 'commit':
        return {
          icon: Lock,
          label: 'Commit Phase',
          color: 'brand' as const,
          primary: committed,
          primaryLabel: 'Committed',
          primaryPercent: commitPercentage,
        };
      case 'reveal':
        return {
          icon: Eye,
          label: 'Reveal Phase',
          color: 'accent' as const,
          primary: revealed,
          primaryLabel: 'Revealed',
          primaryPercent: revealPercentage,
        };
      case 'settled':
        return {
          icon: Check,
          label: 'Settled',
          color: 'success' as const,
          primary: total,
          primaryLabel: 'Complete',
          primaryPercent: 100,
        };
    }
  };

  const config = getPhaseConfig();
  const Icon = config.icon;

  const getSyncStatus = () => {
    if (phase === 'settled') return { text: 'Round Complete', variant: 'success' as const };
    if (isFullySynced) return { text: 'Fully Synced', variant: 'success' as const };
    if (phase === 'commit' && isFullyCommitted) return { text: 'All Committed', variant: 'brand' as const };
    if (phase === 'reveal' && isFullyRevealed) return { text: 'All Revealed', variant: 'accent' as const };
    return { text: 'In Progress', variant: 'neutral' as const };
  };

  const syncStatus = getSyncStatus();

  const variantStyles = {
    default: {
      container: 'p-4 space-y-4',
      header: 'text-base font-bold',
      stats: 'grid grid-cols-2 gap-3',
    },
    compact: {
      container: 'p-3 space-y-3',
      header: 'text-sm font-bold',
      stats: 'flex space-x-3',
    },
  };

  const styles = variantStyles[variant];

  return (
    <GlassCard className={cn(styles.container, className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className={cn('w-4 h-4', `text-${config.color}`)} />
          <h3 className={cn(styles.header, `text-${config.color}`)}>
            Squad Sync
            {squadName && variant !== 'compact' && (
              <span className="text-ink-dim font-normal ml-2">• {squadName}</span>
            )}
          </h3>
        </div>
        
        <Pill variant={syncStatus.variant} size={variant === 'compact' ? 'sm' : 'md'}>
          {syncStatus.text}
        </Pill>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <ProgressGlow
          value={config.primary}
          max={total}
          variant={config.color}
          size={variant === 'compact' ? 'sm' : 'md'}
          animated={animated}
          glow={config.primaryPercent === 100}
          pulse={config.primaryPercent === 100 && phase !== 'settled'}
        />
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-ink-dim">
            {config.primaryLabel}: {config.primary} / {total}
          </span>
          <span className="text-ink font-mono">
            {config.primaryPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Detailed Stats */}
      {variant === 'default' && (
        <div className={styles.stats}>
          {/* Commit Stats */}
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-2 glass rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Lock className="w-3 h-3 text-brand" />
              <span className="text-xs font-medium">Commits</span>
            </div>
            <div className="text-xs font-mono">
              <span className={cn(
                committed === total && total > 0 ? 'text-brand' : 'text-ink'
              )}>
                {committed}
              </span>
              <span className="text-ink-dim">/{total}</span>
            </div>
          </motion.div>

          {/* Reveal Stats */}
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between p-2 glass rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Eye className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium">Reveals</span>
            </div>
            <div className="text-xs font-mono">
              <span className={cn(
                revealed === total && total > 0 ? 'text-accent' : 'text-ink'
              )}>
                {revealed}
              </span>
              <span className="text-ink-dim">/{total}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Team Status */}
      {variant === 'default' && total > 0 && (
        <div className="flex items-center justify-center space-x-2 p-2 glass rounded-lg">
          <Users className="w-3 h-3 text-ink-dim" />
          <span className="text-xs text-ink-dim">
            {total === 1 
              ? 'Solo player' 
              : phase === 'commit'
              ? `${total - committed} members still need to commit`
              : phase === 'reveal'
              ? `${total - revealed} members still need to reveal`
              : 'All members participated'
            }
          </span>
        </div>
      )}
    </GlassCard>
  );
};

export { SquadSyncBar };
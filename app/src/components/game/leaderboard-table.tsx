import * as React from 'react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, TrendingDown, Users, Flame } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AvatarRibbon } from '@/components/ui/avatar-ribbon';
import { Badge } from '@/components/ui/badge';
import { Pill } from '@/components/ui/pill';
import { cn, formatNumber, shortenAddress } from '@/lib/utils';

export type LeaderboardMode = 'weight' | 'streak' | 'squad-sync' | 'winrate';

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  handle?: string;
  avatar?: string;
  streak: number;
  weight: number;
  pnl24h: number;
  winRate: number;
  squadName?: string;
  squadSync?: number;
  level?: 'newcomer' | 'trusted' | 'elite' | 'legend';
  verified?: boolean;
}

export interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  mode: LeaderboardMode;
  onModeChange?: (mode: LeaderboardMode) => void;
  loading?: boolean;
  variant?: 'default' | 'compact';
  maxRows?: number;
  className?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  mode,
  onModeChange,
  loading = false,
  variant = 'default',
  maxRows,
  className,
}) => {
  const [sortColumn, setSortColumn] = useState<keyof LeaderboardEntry | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mode configurations
  const modeConfig = {
    weight: {
      label: 'Weight',
      icon: TrendingUp,
      color: 'brand' as const,
      sortKey: 'weight' as keyof LeaderboardEntry,
    },
    streak: {
      label: 'Streak',
      icon: Flame,
      color: 'accent' as const,
      sortKey: 'streak' as keyof LeaderboardEntry,
    },
    'squad-sync': {
      label: 'Squad Sync',
      icon: Users,
      color: 'success' as const,
      sortKey: 'squadSync' as keyof LeaderboardEntry,
    },
    winrate: {
      label: 'Win Rate',
      icon: Crown,
      color: 'warning' as const,
      sortKey: 'winRate' as keyof LeaderboardEntry,
    },
  };

  const currentMode = modeConfig[mode];

  // Sorted and filtered data
  const sortedData = useMemo(() => {
    let result = [...data];
    
    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'desc' 
            ? bVal.localeCompare(aVal) 
            : aVal.localeCompare(bVal);
        }
        
        return 0;
      });
    } else {
      // Default sort by current mode
      result.sort((a, b) => {
        const aVal = a[currentMode.sortKey];
        const bVal = b[currentMode.sortKey];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return bVal - aVal;
        }
        return 0;
      });
    }

    // Apply row limit
    if (maxRows) {
      result = result.slice(0, maxRows);
    }

    return result;
  }, [data, sortColumn, sortDirection, currentMode.sortKey, maxRows]);

  const handleSort = (column: keyof LeaderboardEntry) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: keyof LeaderboardEntry) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'desc' ? (
      <TrendingDown className="w-3 h-3" />
    ) : (
      <TrendingUp className="w-3 h-3" />
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 3: return <div className="w-4 h-4 rounded-full bg-amber-600" />;
      default: return <span className="text-ink-dim font-mono">{rank}</span>;
    }
  };

  const formatValue = (value: any, key: keyof LeaderboardEntry) => {
    switch (key) {
      case 'weight':
        return formatNumber(value);
      case 'pnl24h':
        return (
          <span className={cn(
            'font-mono',
            value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-ink-dim'
          )}>
            {value > 0 ? '+' : ''}{formatNumber(value)}
          </span>
        );
      case 'winRate':
        return (
          <span className="font-mono">
            {value.toFixed(1)}%
          </span>
        );
      case 'squadSync':
        return value ? (
          <span className="font-mono">
            {value.toFixed(1)}%
          </span>
        ) : '—';
      default:
        return value;
    }
  };

  const variantStyles = {
    default: {
      container: 'p-6',
      header: 'text-xl font-bold mb-6',
      table: 'space-y-3',
      row: 'p-4',
    },
    compact: {
      container: 'p-4',
      header: 'text-lg font-bold mb-4',
      table: 'space-y-2',
      row: 'p-3',
    },
  };

  const styles = variantStyles[variant];

  return (
    <GlassCard className={cn(styles.container, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <currentMode.icon className={cn('w-6 h-6', `text-${currentMode.color}`)} />
          <h2 className={cn(styles.header, `text-${currentMode.color}`)}>
            Leaderboard
          </h2>
        </div>

        {/* Mode Tabs */}
        {onModeChange && (
          <div className="flex space-x-2">
            {Object.entries(modeConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = key === mode;
              
              return (
                <button
                  key={key}
                  onClick={() => onModeChange(key as LeaderboardMode)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-glass-strong text-ink border border-white/20' 
                      : 'text-ink-dim hover:text-ink hover:bg-glass'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {variant !== 'compact' && <span>{config.label}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table Header */}
      {variant === 'default' && (
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-ink-dim border-b border-white/10">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div 
            className="col-span-2 cursor-pointer hover:text-ink flex items-center space-x-1"
            onClick={() => handleSort('streak')}
          >
            <span>Streak</span>
            {getSortIcon('streak')}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-ink flex items-center space-x-1"
            onClick={() => handleSort('weight')}
          >
            <span>Weight</span>
            {getSortIcon('weight')}
          </div>
          <div 
            className="col-span-2 cursor-pointer hover:text-ink flex items-center space-x-1"
            onClick={() => handleSort('pnl24h')}
          >
            <span>24h P/L</span>
            {getSortIcon('pnl24h')}
          </div>
          <div className="col-span-1">Squad</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Rows */}
      {!loading && (
        <div className={styles.table}>
          {sortedData.map((entry, index) => (
            <motion.div
              key={entry.wallet}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'glass rounded-xl transition-all duration-200 hover:bg-glass-strong',
                styles.row
              )}
            >
              {variant === 'default' ? (
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Player */}
                  <div className="col-span-4">
                    <AvatarRibbon
                      src={entry.avatar}
                      handle={entry.handle || shortenAddress(entry.wallet)}
                      size="sm"
                      streak={entry.streak}
                      winRate={entry.winRate}
                      level={entry.level}
                      verified={entry.verified}
                      showStats={false}
                    />
                  </div>

                  {/* Streak */}
                  <div className="col-span-2">
                    <Badge streak={entry.streak} size="sm" />
                  </div>

                  {/* Weight */}
                  <div className="col-span-2 font-mono text-brand">
                    {formatValue(entry.weight, 'weight')}
                  </div>

                  {/* 24h P/L */}
                  <div className="col-span-2">
                    {formatValue(entry.pnl24h, 'pnl24h')}
                  </div>

                  {/* Squad */}
                  <div className="col-span-1">
                    {entry.squadName ? (
                      <Pill variant="neutral" size="sm">
                        {entry.squadName.slice(0, 3)}
                      </Pill>
                    ) : (
                      <span className="text-ink-dim text-xs">—</span>
                    )}
                  </div>
                </div>
              ) : (
                // Compact variant
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRankIcon(entry.rank)}
                    <AvatarRibbon
                      src={entry.avatar}
                      handle={entry.handle || shortenAddress(entry.wallet)}
                      size="sm"
                      level={entry.level}
                      verified={entry.verified}
                      showStats={false}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge streak={entry.streak} size="sm" />
                    <div className="font-mono text-brand text-sm">
                      {formatValue(entry[currentMode.sortKey], currentMode.sortKey)}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-ink-dim/10 rounded-full flex items-center justify-center mb-4">
            <currentMode.icon className="w-8 h-8 text-ink-dim" />
          </div>
          <h3 className="text-lg font-bold text-ink-dim mb-2">No Data Yet</h3>
          <p className="text-sm text-ink-dim opacity-75">
            The leaderboard will populate as players join the game.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export { LeaderboardTable };
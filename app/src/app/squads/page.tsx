'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, TrendingUp, Filter, Shield, Zap, Crown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { KPI } from '@/components/ui/kpi';
import { Input } from '@/components/ui/input';
import { formatNumber, shortenAddress } from '@/lib/utils';
import { useAllSquads } from '@/hooks/useDatabase';

// Mock squad data for demonstration
const MOCK_SQUADS = [
  {
    id: '1',
    name: 'Alpha Squad',
    emblem_url: undefined,
    created_at: new Date().toISOString(),
    memberCount: 12,
    maxMembers: 20,
    totalStaked: 125000,
    authority: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    description: 'Elite players focused on consistent splitting strategies',
    winRate: 85,
    avgStreak: 15,
    isOpen: true,
  },
  {
    id: '2',
    name: 'Beta Squad',
    emblem_url: undefined,
    created_at: new Date().toISOString(),
    memberCount: 8,
    maxMembers: 15,
    totalStaked: 89000,
    authority: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
    description: 'Aggressive steal-focused team with high risk tolerance',
    winRate: 78,
    avgStreak: 8,
    isOpen: true,
  },
  {
    id: '3',
    name: 'Gamma Squad',
    emblem_url: undefined,
    created_at: new Date().toISOString(),
    memberCount: 20,
    maxMembers: 20,
    totalStaked: 156000,
    authority: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    description: 'Balanced approach with emphasis on squad coordination',
    winRate: 72,
    avgStreak: 12,
    isOpen: false,
  },
  {
    id: '4',
    name: 'Delta Squad',
    emblem_url: undefined,
    created_at: new Date().toISOString(),
    memberCount: 6,
    maxMembers: 25,
    totalStaked: 67000,
    authority: '2Bm7KxJfYBJJfXJBbVtJQJXBJXBJXBJXBJXBJXBJXBJ',
    description: 'New squad welcoming beginners and veterans alike',
    winRate: 64,
    avgStreak: 6,
    isOpen: true,
  },
];

export default function SquadsPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  
  // Real data hooks (fallback to mock data)
  const { data: allSquads = MOCK_SQUADS, isLoading } = useAllSquads();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const filteredSquads = allSquads.filter(squad => {
    const matchesSearch = squad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (squad.description && squad.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'open' && squad.isOpen) ||
                         (selectedFilter === 'full' && !squad.isOpen);
    
    return matchesSearch && matchesFilter;
  });

  const totalMembers = allSquads.reduce((sum, squad) => sum + squad.memberCount, 0);
  const totalStaked = allSquads.reduce((sum, squad) => sum + squad.totalStaked, 0);
  const avgWinRate = allSquads.length > 0 ? Math.round(allSquads.reduce((sum, squad) => sum + squad.winRate, 0) / allSquads.length) : 0;

  return (
    <div className="min-h-screen bg-bg section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-gradient">Squads</span>
          </h1>
          <p className="text-xl text-ink-dim max-w-2xl mx-auto mb-8">
            Join forces with other players. Coordinate strategies, share rewards, and dominate the leaderboards together.
          </p>
          
          <Button 
            onClick={() => router.push('/squads/create')} 
            className="bg-brand hover:bg-brand/90 text-bg font-bold px-8 py-4 text-lg"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Squad
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-dim" />
                <Input
                  type="text"
                  placeholder="Search squads by name or description..."
                  className="pl-10 glass focus-brand"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-ink-dim" />
                <select
                  className="glass border border-white/10 rounded-2xl px-4 py-2 text-ink focus-brand bg-glass backdrop-blur-xl"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Squads</option>
                  <option value="open">Open Squads</option>
                  <option value="full">Full Squads</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Squad Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {isLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <GlassCard key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-white/10 rounded mb-4"></div>
                <div className="h-20 bg-white/10 rounded mb-4"></div>
                <div className="h-10 bg-white/10 rounded"></div>
              </GlassCard>
            ))
          ) : filteredSquads.length > 0 ? (
            filteredSquads.map((squad, index) => (
              <motion.div
                key={squad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <GlassCard className="p-6 h-full hover-lift" hover>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-brand to-accent flex items-center justify-center">
                        <Shield className="w-6 h-6 text-bg" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ink">{squad.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-ink-dim">
                          <Users className="h-4 w-4" />
                          <span>{squad.memberCount}/{squad.maxMembers} members</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={squad.isOpen ? 'brand' : 'neutral'}
                      size="sm"
                    >
                      {squad.isOpen ? 'Open' : 'Full'}
                    </Badge>
                  </div>

                  <p className="text-ink-dim text-sm mb-6 leading-relaxed">
                    {squad.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-xl bg-glass">
                        <div className="text-lg font-bold text-brand">
                          {formatNumber(squad.totalStaked)}
                        </div>
                        <div className="text-xs text-ink-dim">Total Staked</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-glass">
                        <div className="text-lg font-bold text-accent">
                          {squad.winRate}%
                        </div>
                        <div className="text-xs text-ink-dim">Win Rate</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-ink-dim mb-2">
                        <span>Squad Capacity</span>
                        <span>{Math.round((squad.memberCount / squad.maxMembers) * 100)}%</span>
                      </div>
                      <ProgressGlow 
                        value={(squad.memberCount / squad.maxMembers) * 100}
                        variant="brand"
                        size="sm"
                        glow
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full glass-button"
                      onClick={() => router.push(`/squads/${squad.id}`)}
                    >
                      View Details
                    </Button>
                    
                    {squad.isOpen ? (
                      <Button 
                        className="w-full bg-brand hover:bg-brand/90 text-bg font-medium" 
                        onClick={() => {
                          if (!connected) {
                            // Handle wallet connection
                            return;
                          }
                          // Handle join squad
                          router.push(`/squads/${squad.id}`);
                        }}
                      >
                        {connected ? 'Join Squad' : 'Connect Wallet to Join'}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Squad Full
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            // Empty state
            <div className="col-span-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <GlassCard className="p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">No squads found</h3>
                  <p className="text-ink-dim mb-6">
                    {allSquads.length === 0 
                      ? "No squads have been created yet. Be the first to start one!"
                      : "Try adjusting your search criteria or create a new squad."
                    }
                  </p>
                  <Button 
                    onClick={() => router.push('/squads/create')}
                    className="bg-brand hover:bg-brand/90 text-bg font-medium"
                  >
                    Create New Squad
                  </Button>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <GlassCard className="p-6 text-center hover-lift" hover>
            <KPI
              value={allSquads.length}
              label="Active Squads"
              icon={Shield}
              variant="brand"
              size="lg"
              animated
            />
          </GlassCard>
          
          <GlassCard className="p-6 text-center hover-lift" hover>
            <KPI
              value={totalMembers}
              label="Total Members"
              icon={Users}
              variant="accent"
              size="lg"
              animated
            />
          </GlassCard>
          
          <GlassCard className="p-6 text-center hover-lift" hover>
            <KPI
              value={formatNumber(totalStaked)}
              label="Total Staked"
              icon={TrendingUp}
              variant="success"
              size="lg"
              animated
            />
          </GlassCard>
          
          <GlassCard className="p-6 text-center hover-lift" hover>
            <KPI
              value={`${avgWinRate}%`}
              label="Avg Win Rate"
              icon={Crown}
              variant="warning"
              size="lg"
              animated
            />
          </GlassCard>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <GlassCard className="p-8" glow>
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              Ready to Squad Up?
            </h3>
            <p className="text-ink-dim mb-6 max-w-2xl mx-auto">
              Join an existing squad or create your own. Coordinate strategies, share rewards, and climb the leaderboards together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/squads/create')}
                className="bg-brand hover:bg-brand/90 text-bg font-bold px-8 py-3"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Squad
              </Button>
              <Button 
                variant="outline"
                className="glass-button px-8 py-3"
                size="lg"
                onClick={() => {
                  // Scroll to squad grid
                  document.querySelector('.grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Zap className="w-5 h-5 mr-2" />
                Browse Squads
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
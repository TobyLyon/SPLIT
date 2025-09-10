'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, TrendingUp, Filter } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatNumber, shortenAddress } from '@/lib/utils';
import { useAllSquads, useJoinSquad } from '@/hooks/useBlockchain';
import { useNotifications } from '@/hooks/useNotifications';

export default function SquadsPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  
  // Real data hooks
  const { data: allSquads = [], isLoading } = useAllSquads();
  const joinSquadMutation = useJoinSquad();
  const { addNotification } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const filteredSquads = allSquads.filter(squad => {
    const matchesSearch = squad.data.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'open' && squad.data.memberCount < squad.data.maxMembers) ||
                         (selectedFilter === 'full' && squad.data.memberCount === squad.data.maxMembers);
    
    return matchesSearch && matchesFilter;
  });

  const handleJoinSquad = async (squadPubkey: string) => {
    if (!connected) {
      addNotification({
        type: 'warning',
        title: 'Wallet Required',
        message: 'Please connect your wallet to join a squad.',
      });
      return;
    }
    
    try {
      await joinSquadMutation.mutateAsync(squadPubkey);
      router.push(`/squad/${squadPubkey}`);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-dual mb-2">
              Discover Squads
            </h1>
            <p className="text-muted-foreground">
              Join existing squads or create your own to start earning rewards together.
            </p>
          </div>
          <Button onClick={() => router.push('/squads/create')} className="group">
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
            Create Squad
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card variant="glass" className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search squads by name, description, or tags..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-mint/50 focus:border-brand-mint/50 text-foreground placeholder-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-mint/50"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Squads</option>
                <option value="open">Open Squads</option>
                <option value="full">Full Squads</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Squad Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          // Loading skeleton
          [...Array(6)].map((_, i) => (
            <Card key={i} variant="glass" className="h-full animate-pulse">
              <CardHeader>
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-white/10 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-20 bg-white/10 rounded"></div>
                <div className="h-10 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredSquads.length > 0 ? (
          filteredSquads.map((squad, index) => (
            <motion.div
              key={squad.pubkey.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card variant="glass" className="h-full hover:scale-[1.02] transition-transform duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl mb-1">{squad.data.name}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{squad.data.memberCount}/{squad.data.maxMembers} members</span>
                      </div>
                    </div>
                    <Badge variant={squad.data.memberCount < squad.data.maxMembers ? 'mint' : 'glass'}>
                      {squad.data.memberCount < squad.data.maxMembers ? 'Open' : 'Full'}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    Squad ID: {shortenAddress(squad.pubkey.toString())}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Staked</span>
                      <span className="font-mono text-brand-mint">
                        {formatNumber(Number(squad.data.totalStaked) / 1_000_000)} $SPLIT
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Squad Capacity</span>
                        <span>{((squad.data.memberCount / squad.data.maxMembers) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(squad.data.memberCount / squad.data.maxMembers) * 100} 
                        variant="gradient"
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Authority</span>
                      <span className="font-mono text-brand-violet">
                        {shortenAddress(squad.data.authority.toString())}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    <Button
                      variant="glass"
                      className="w-full"
                      onClick={() => router.push(`/squad/${squad.pubkey.toString()}`)}
                    >
                      View Details
                    </Button>
                    
                    {squad.data.memberCount < squad.data.maxMembers ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleJoinSquad(squad.pubkey.toString())}
                        disabled={!connected}
                        loading={joinSquadMutation.isPending}
                      >
                        {connected ? 'Join Squad' : 'Connect Wallet to Join'}
                      </Button>
                    ) : (
                      <Button variant="glass" className="w-full" disabled>
                        Squad Full
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
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
              <Card variant="glass" className="p-8 max-w-md mx-auto">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No squads found</h3>
                <p className="text-muted-foreground mb-4">
                  {allSquads.length === 0 
                    ? "No squads have been created yet. Be the first to start one!"
                    : "Try adjusting your search criteria or create a new squad."
                  }
                </p>
                <Button onClick={() => router.push('/squads/create')}>
                  Create New Squad
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Empty State */}
      {filteredSquads.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Card variant="glass" className="p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No squads found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or create a new squad.
            </p>
            <Button onClick={() => router.push('/squads/create')}>
              Create New Squad
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card variant="glass" className="text-center p-4">
          <div className="text-2xl font-bold text-gradient-mint">
            {featuredSquads.length}
          </div>
          <p className="text-sm text-muted-foreground">Active Squads</p>
        </Card>
        
        <Card variant="glass" className="text-center p-4">
          <div className="text-2xl font-bold text-gradient-violet">
            {featuredSquads.reduce((sum, squad) => sum + squad.memberCount, 0)}
          </div>
          <p className="text-sm text-muted-foreground">Total Members</p>
        </Card>
        
        <Card variant="glass" className="text-center p-4">
          <div className="text-2xl font-bold text-gradient-mint">
            {formatNumber(featuredSquads.reduce((sum, squad) => sum + squad.totalStaked, 0))}
          </div>
          <p className="text-sm text-muted-foreground">Total Staked</p>
        </Card>
        
        <Card variant="glass" className="text-center p-4">
          <div className="text-2xl font-bold text-gradient-violet">
            {formatNumber(featuredSquads.reduce((sum, squad) => sum + squad.recentRewards, 0))}
          </div>
          <p className="text-sm text-muted-foreground">Rewards Paid</p>
        </Card>
      </motion.div>
    </div>
  );
}
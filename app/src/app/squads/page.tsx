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

// Mock data for squad discovery
const featuredSquads = [
  {
    id: '1',
    name: 'DeFi Legends',
    description: 'Elite DeFi strategists focused on yield optimization and risk management.',
    memberCount: 8,
    maxMembers: 8,
    totalStaked: 150000,
    rank: 1,
    recentRewards: 2500,
    tags: ['DeFi', 'Yield Farming', 'Expert'],
    isPublic: true,
  },
  {
    id: '2',
    name: 'Solana Builders',
    description: 'Developers and builders creating the future of Solana ecosystem.',
    memberCount: 6,
    maxMembers: 8,
    totalStaked: 125000,
    rank: 2,
    recentRewards: 2100,
    tags: ['Development', 'Solana', 'Building'],
    isPublic: true,
  },
  {
    id: '3',
    name: 'Crypto Innovators',
    description: 'Forward-thinking investors exploring emerging crypto opportunities.',
    memberCount: 7,
    maxMembers: 8,
    totalStaked: 98000,
    rank: 3,
    recentRewards: 1800,
    tags: ['Innovation', 'Investment', 'Research'],
    isPublic: true,
  },
  {
    id: '4',
    name: 'NFT Collectors',
    description: 'Art enthusiasts and NFT collectors with a passion for digital creativity.',
    memberCount: 4,
    maxMembers: 6,
    totalStaked: 76000,
    rank: 8,
    recentRewards: 1200,
    tags: ['NFT', 'Art', 'Collecting'],
    isPublic: true,
  },
  {
    id: '5',
    name: 'GameFi Squad',
    description: 'Gaming enthusiasts exploring play-to-earn and blockchain gaming.',
    memberCount: 5,
    maxMembers: 8,
    totalStaked: 65000,
    rank: 12,
    recentRewards: 980,
    tags: ['Gaming', 'P2E', 'Fun'],
    isPublic: true,
  },
];

export default function SquadsPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const filteredSquads = featuredSquads.filter(squad => {
    const matchesSearch = squad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         squad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         squad.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'open' && squad.memberCount < squad.maxMembers) ||
                         (selectedFilter === 'full' && squad.memberCount === squad.maxMembers);
    
    return matchesSearch && matchesFilter;
  });

  const handleJoinSquad = (squadId: string) => {
    if (!connected) {
      // Trigger wallet connection
      return;
    }
    // Implement join squad logic
    console.log('Joining squad:', squadId);
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
        {filteredSquads.map((squad, index) => (
          <motion.div
            key={squad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card variant="glass" className="h-full hover:scale-[1.02] transition-transform duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-xl mb-1">{squad.name}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{squad.memberCount}/{squad.maxMembers} members</span>
                      <Badge variant="glass" className="text-xs">
                        Rank #{squad.rank}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={squad.memberCount < squad.maxMembers ? 'mint' : 'glass'}>
                    {squad.memberCount < squad.maxMembers ? 'Open' : 'Full'}
                  </Badge>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {squad.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {squad.tags.map((tag) => (
                    <Badge key={tag} variant="glass" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Staked</span>
                    <span className="font-mono text-brand-mint">
                      {formatNumber(squad.totalStaked)} $SPLIT
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Squad Capacity</span>
                      <span>{((squad.memberCount / squad.maxMembers) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={(squad.memberCount / squad.maxMembers) * 100} 
                      variant="gradient"
                      className="h-2"
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Recent Rewards</span>
                    <span className="font-mono text-brand-violet">
                      +{formatNumber(squad.recentRewards)} $SPLIT
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  {squad.memberCount < squad.maxMembers ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinSquad(squad.id)}
                      disabled={!connected}
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
        ))}
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
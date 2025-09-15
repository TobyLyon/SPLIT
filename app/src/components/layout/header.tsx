'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Trophy, Users, Zap, User, Coins } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { PotMeter } from '@/components/game/pot-meter';
import { AvatarRibbon } from '@/components/ui/avatar-ribbon';
import { AnimatedAscii } from '@/components/ui/animated-ascii';
import { HeaderPotWidget } from '@/components/ui/header-pot-widget';
import { useCommunityPot, useCurrentProfile, useCurrentUserStats } from '@/hooks/useDatabase';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Game', href: '/', icon: Zap },
  { name: 'Squads', href: '/squads', icon: Users },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connected, publicKey } = useWallet();
  
  // Data hooks
  const { data: potTotal = 0 } = useCommunityPot();
  const { data: profile } = useCurrentProfile();
  const { data: userStats } = useCurrentUserStats();

  const nextUnlockDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // Mock: 4h from now

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl">
      <div className="glass-strong">
        <div className="mx-auto max-w-7xl container-padding">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-20 flex items-center justify-center">
                    <AnimatedAscii 
                      size="sm" 
                      glow 
                      interval={4000}
                      className="text-xl leading-none whitespace-nowrap"
                    />
                  </div>
                  <span className="text-2xl font-bold text-gradient">
                    SPLIT
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Community Pot Inline (Desktop) */}
            <div className="hidden lg:flex flex-1 justify-center max-w-md mx-8">
              <HeaderPotWidget
                current={potTotal || 125000}
                target={200000}
                nextUnlockAt={nextUnlockDate}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-sm font-medium text-ink-dim hover:text-ink transition-colors hover-lift px-3 py-2 rounded-xl"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Profile Avatar (when connected) */}
              {connected && profile && (
                <Link href={`/profile/${profile.handle || 'me'}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <AvatarRibbon
                      src={profile.avatar_url}
                      handle={profile.handle}
                      size="sm"
                      streak={userStats?.current_streak || 0}
                      winRate={userStats?.winrate || 0}
                      showStats={false}
                      animated={false}
                    />
                  </motion.div>
                </Link>
              )}

              {/* Wallet connection */}
              <div className="wallet-adapter-button-wrapper">
                <WalletMultiButton className="glass-button !text-ink hover:!bg-glass-strong" />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden glass hover:bg-glass-strong"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-glass-strong backdrop-blur-xl"
          >
            <div className="container-padding py-4 space-y-4">
              {/* Mobile Community Pot */}
              <div className="lg:hidden">
                <PotMeter
                  current={potTotal || 125000}
                  target={200000}
                  nextUnlockAt={nextUnlockDate}
                  variant="compact"
                  animated={false}
                  showCountdown
                />
              </div>

              {/* Mobile Navigation */}
              <GlassCard className="p-4">
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-glass transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5 text-brand" />
                        <span className="font-medium text-ink">{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Mobile Profile Link */}
                  {connected && profile && (
                    <Link
                      href={`/profile/${profile.handle || 'me'}`}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-glass transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 text-brand" />
                      <span className="font-medium text-ink">Profile</span>
                    </Link>
                  )}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
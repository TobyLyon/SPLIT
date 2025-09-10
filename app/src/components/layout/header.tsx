'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Trophy, Users, Wallet } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Users },
  { name: 'Squads', href: '/squads', icon: Users },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connected } = useWallet();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl">
      <div className="glass-strong">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-mint to-brand-violet flex items-center justify-center">
                  <span className="text-brand-dark font-bold text-sm">SS</span>
                </div>
                <span className="text-xl font-bold text-gradient-dual">
                  SplitSquads
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-4 w-4" />
              </Button>

              {/* Wallet connection */}
              <div className="wallet-adapter-button-wrapper">
                <WalletMultiButton className="!bg-brand-mint !text-brand-dark hover:!bg-brand-mint/90 !rounded-lg !font-medium !transition-all !duration-200 hover:!scale-105" />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
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
            className="md:hidden border-t border-white/10"
          >
            <Card variant="glass-strong" className="mx-4 mt-2 mb-4 rounded-lg">
              <div className="p-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 text-brand-mint" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile search */}
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors w-full text-left">
                  <Search className="h-5 w-5 text-brand-mint" />
                  <span className="font-medium">Search</span>
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Custom wallet button styles
export const walletButtonStyles = `
  .wallet-adapter-button {
    background-color: #4EF2C4 !important;
    color: #0A0F14 !important;
    border-radius: 0.5rem !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
    border: none !important;
  }
  
  .wallet-adapter-button:hover {
    background-color: rgba(78, 242, 196, 0.9) !important;
    transform: scale(1.05) !important;
    box-shadow: 0 0 20px rgba(78, 242, 196, 0.3) !important;
  }
  
  .wallet-adapter-button:active {
    transform: scale(0.98) !important;
  }
  
  .wallet-adapter-dropdown {
    background-color: rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(24px) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 0.75rem !important;
  }
  
  .wallet-adapter-dropdown-list-item {
    background-color: transparent !important;
    color: white !important;
  }
  
  .wallet-adapter-dropdown-list-item:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
`;
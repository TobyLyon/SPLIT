'use client';

import Link from 'next/link';
import { Github, Twitter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  product: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Squads', href: '/squads' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'How it Works', href: '/how-it-works' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Support', href: '/support' },
    { name: 'Status', href: '/status' },
  ],
  community: [
    { name: 'Twitter', href: 'https://twitter.com/splitsquads', icon: Twitter },
    { name: 'Discord', href: 'https://discord.gg/splitsquads', icon: ExternalLink },
    { name: 'GitHub', href: 'https://github.com/splitsquads', icon: Github },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="glass-strong">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand to-accent flex items-center justify-center">
                  <span className="text-bg font-bold text-sm">SS</span>
                </div>
                <span className="text-xl font-bold text-gradient-dual">
                  SplitSquads
                </span>
              </Link>
              <p className="text-muted-foreground max-w-md mb-6">
                Rewards-sharing social staking on Solana. Join squads, stake $SPLIT tokens, and earn rewards based on your contribution and activity.
              </p>
              <div className="flex items-center space-x-4">
                {footerLinks.community.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-brand" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center space-x-1"
                    >
                      <span>{item.name}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2024 SplitSquads. Built on Solana.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-brand transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-brand transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
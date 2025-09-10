'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Trophy, Zap, Shield, TrendingUp, Star } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

// Mock data for demo
const stats = {
  totalStaked: 1250000,
  activeSquads: 342,
  totalMembers: 1847,
  rewardsDistributed: 89500,
};

const features = [
  {
    icon: Users,
    title: 'Squad Formation',
    description: 'Form or join squads of 2-8 members and stake together for enhanced rewards.',
    color: 'mint',
  },
  {
    icon: TrendingUp,
    title: 'Dynamic Weights',
    description: 'Earn more based on stake amount, tenure, squad size, and activity score.',
    color: 'violet',
  },
  {
    icon: Trophy,
    title: 'Competitive Leaderboards',
    description: 'Compete with other squads and members for top rankings and recognition.',
    color: 'mint',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Built on Solana with open-source smart contracts and transparent distribution.',
    color: 'violet',
  },
];

const testimonials = [
  {
    name: 'Alex Chen',
    handle: '@alexbuilds',
    content: 'SplitSquads revolutionized how our team approaches DeFi rewards. The social aspect makes staking actually fun!',
    avatar: '🧑‍💻',
  },
  {
    name: 'Sarah Kim',
    handle: '@sarahdefi',
    content: 'Love the tenure multiplier system. Been with my squad for 3 months and seeing great rewards!',
    avatar: '👩‍🚀',
  },
  {
    name: 'Mike Rodriguez',
    handle: '@mikesolana',
    content: 'The glassmorphic UI is stunning and the rewards distribution is completely fair and transparent.',
    avatar: '🎨',
  },
];

export default function HomePage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (connected) {
      router.push('/dashboard');
    } else {
      // Wallet connection will be handled by the header
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge variant="glass" className="mb-6">
              <Star className="mr-2 h-3 w-3" />
              Rewards-Sharing Social Staking
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              <span className="text-gradient-dual">Split</span> the Rewards,{' '}
              <br className="hidden sm:block" />
              <span className="text-gradient-mint">Share</span> the Success
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
              Join squads, stake $SPLIT tokens, and earn rewards based on your contribution, 
              tenure, and activity. The future of social DeFi is here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                onClick={handleGetStarted}
                className="group"
              >
                {connected ? 'Go to Dashboard' : 'Connect Wallet to Start'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-mint/5 blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-violet/5 blur-3xl"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8"
          >
            <Card variant="glass" className="text-center p-6">
              <div className="stat-number text-gradient-mint">
                ${formatNumber(stats.totalStaked)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total Staked</p>
            </Card>
            <Card variant="glass" className="text-center p-6">
              <div className="stat-number text-gradient-violet">
                {formatNumber(stats.activeSquads)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Active Squads</p>
            </Card>
            <Card variant="glass" className="text-center p-6">
              <div className="stat-number text-gradient-mint">
                {formatNumber(stats.totalMembers)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total Members</p>
            </Card>
            <Card variant="glass" className="text-center p-6">
              <div className="stat-number text-gradient-violet">
                ${formatNumber(stats.rewardsDistributed)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Rewards Paid</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              Why Choose <span className="text-gradient-dual">SplitSquads</span>?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience the next generation of social staking with dynamic rewards, 
              competitive gameplay, and transparent distribution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card variant="glass" className="h-full p-6 hover:scale-[1.02] transition-transform duration-300">
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg bg-brand-${feature.color}/20 flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 text-brand-${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              What Our <span className="text-gradient-mint">Community</span> Says
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Join thousands of users who are already earning rewards with SplitSquads.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.handle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="glass" className="p-6">
                  <CardContent className="pt-0">
                    <p className="text-foreground mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-brand-mint">{testimonial.handle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card variant="glass-strong" className="p-12 text-center">
              <CardContent>
                <h2 className="text-3xl font-bold sm:text-4xl mb-4">
                  Ready to <span className="text-gradient-dual">Split & Earn</span>?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Connect your wallet and start earning rewards with your squad today.
                </p>
                <Button 
                  size="xl" 
                  onClick={handleGetStarted}
                  className="group"
                >
                  {connected ? 'Enter Dashboard' : 'Connect Wallet'}
                  <Zap className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
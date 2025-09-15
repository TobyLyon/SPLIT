import * as React from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Copy, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarRibbon } from '@/components/ui/avatar-ribbon';
import { cn, shortenAddress } from '@/lib/utils';

export interface ShareCardPreviewProps {
  wallet: string;
  handle?: string;
  avatar?: string;
  streak: number;
  choice?: 'split' | 'steal';
  payout?: number;
  squadName?: string;
  squadEmblem?: string;
  variant?: 'result' | 'streak' | 'achievement';
  animated?: boolean;
  className?: string;
}

const ShareCardPreview: React.FC<ShareCardPreviewProps> = ({
  wallet,
  handle,
  avatar,
  streak,
  choice,
  payout,
  squadName,
  squadEmblem,
  variant = 'result',
  animated = true,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Generate OG image URL
  const generateOGUrl = () => {
    const params = new URLSearchParams({
      wallet,
      ...(handle && { handle }),
      ...(streak && { streak: streak.toString() }),
      ...(choice && { choice }),
      ...(payout && { payout: payout.toString() }),
      ...(squadName && { squad: squadName }),
      variant,
    });

    return `/api/og/result?${params.toString()}`;
  };

  const ogUrl = generateOGUrl();
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${ogUrl}` 
    : ogUrl;

  // Generate share texts
  const getShareText = () => {
    const displayName = handle || shortenAddress(wallet);
    
    switch (variant) {
      case 'result':
        return choice && payout
          ? `Just ${choice === 'split' ? 'shared' : 'stole'} ${payout} $SPLIT! 🎯 ${streak > 0 ? `${streak} day streak 🔥` : ''} Playing @SplitSquads`
          : `Made my daily choice on @SplitSquads! ${streak > 0 ? `${streak} day streak 🔥` : ''}`;
      
      case 'streak':
        return `${streak} day streak on @SplitSquads! 🔥 ${streak >= 10 ? 'Elite status unlocked!' : 'Building momentum!'} ${squadName ? `Squad: ${squadName}` : ''}`;
      
      case 'achievement':
        return `Achievement unlocked on @SplitSquads! 🏆 ${streak >= 20 ? 'Legendary streak!' : streak >= 10 ? 'Elite player!' : 'Rising star!'} ${squadName ? `Squad: ${squadName}` : ''}`;
      
      default:
        return `Playing @SplitSquads - the social staking game on Solana! 🎯`;
    }
  };

  const shareText = getShareText();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getVariantConfig = () => {
    switch (variant) {
      case 'result':
        return {
          title: 'Share Your Result',
          description: 'Show off your daily choice outcome',
          color: choice === 'split' ? 'brand' : choice === 'steal' ? 'accent' : 'default',
        };
      case 'streak':
        return {
          title: 'Share Your Streak',
          description: 'Celebrate your consistency',
          color: streak >= 20 ? 'warning' : streak >= 10 ? 'accent' : 'brand',
        };
      case 'achievement':
        return {
          title: 'Share Achievement',
          description: 'Broadcast your milestone',
          color: 'success',
        };
      default:
        return {
          title: 'Share',
          description: 'Spread the word',
          color: 'default',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <GlassCard className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-brand" />
            <span>{config.title}</span>
          </h3>
          <p className="text-sm text-ink-dim">{config.description}</p>
        </div>
      </div>

      {/* Preview Card */}
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.95 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-[1.91/1] bg-gradient-to-br from-bg via-brand-900/20 to-accent-900/20 rounded-2xl overflow-hidden border border-white/10"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(52,245,197,0.3),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(155,92,255,0.2),transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          {/* Top */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <AvatarRibbon
                src={avatar}
                handle={handle || shortenAddress(wallet)}
                size="md"
                level="trusted"
                showStats={false}
              />
            </div>
            
            {squadName && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-glass rounded-full">
                <span className="text-xs font-medium text-ink-dim">Squad</span>
                <span className="text-xs font-bold text-ink">{squadName}</span>
              </div>
            )}
          </div>

          {/* Center */}
          <div className="text-center space-y-3">
            {variant === 'result' && choice && payout && (
              <>
                <div className="text-3xl font-bold">
                  <span className={cn(
                    choice === 'split' ? 'text-brand' : 'text-accent'
                  )}>
                    {choice.toUpperCase()}
                  </span>
                </div>
                <div className="text-xl font-mono">
                  +{payout} $SPLIT
                </div>
              </>
            )}

            {variant === 'streak' && (
              <div className="flex items-center justify-center">
                <Badge streak={streak} size="lg" glow />
              </div>
            )}

            {variant === 'achievement' && (
              <div className="text-center space-y-2">
                <div className="text-2xl">🏆</div>
                <div className="text-lg font-bold text-brand">
                  {streak >= 20 ? 'Legend' : streak >= 10 ? 'Elite' : 'Rising Star'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-ink-dim">
              @SplitSquads
            </div>
            {streak > 0 && (
              <div className="text-xs font-mono text-ink">
                {streak} day streak 🔥
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Share Actions */}
      <div className="space-y-3">
        {/* Share Text */}
        <div className="p-3 glass rounded-xl">
          <div className="text-sm text-ink-dim mb-2">Share text:</div>
          <div className="text-sm text-ink">{shareText}</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* Twitter */}
          <Button
            onClick={() => window.open(twitterUrl, '_blank')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Tweet
          </Button>

          {/* Copy Link */}
          <Button
            onClick={() => handleCopy(fullUrl)}
            variant="outline"
            size="sm"
            className={cn(
              'transition-all duration-200',
              copied && 'bg-green-500/20 border-green-500/50 text-green-400'
            )}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          {/* View Image */}
          <Button
            onClick={() => window.open(fullUrl, '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View
          </Button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="text-xs text-ink-dim text-center opacity-75">
        💡 Share your results to attract new squad members and grow the community pot!
      </div>
    </GlassCard>
  );
};

export { ShareCardPreview };
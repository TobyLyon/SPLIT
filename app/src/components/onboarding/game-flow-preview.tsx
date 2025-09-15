'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Lock, 
  Eye, 
  Coins, 
  Users, 
  Trophy,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { ChoiceButton } from '@/components/ui/choice-button';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { Badge } from '@/components/ui/badge';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/utils';

interface GameStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  phase: 'commit' | 'reveal' | 'results' | 'payout';
  duration: string;
  action: string;
}

const GAME_STEPS: GameStep[] = [
  {
    id: 'commit',
    title: 'Commit Your Choice',
    description: 'Every day at 00:00 UTC, choose Split or Steal. Your choice is encrypted and hidden from others.',
    icon: Lock,
    phase: 'commit',
    duration: '12 hours',
    action: 'Choose Split or Steal'
  },
  {
    id: 'reveal',
    title: 'Reveal Phase',
    description: 'After commit phase ends, reveal your choice. This proves you committed to your decision.',
    icon: Eye,
    phase: 'reveal',
    duration: '12 hours',
    action: 'Reveal your choice'
  },
  {
    id: 'results',
    title: 'Results & Scoring',
    description: 'See how everyone played. Splitters share the pot, Stealers try to take it all.',
    icon: Trophy,
    phase: 'results',
    duration: 'Instant',
    action: 'View results'
  },
  {
    id: 'payout',
    title: 'Automatic Payout',
    description: 'Winners receive their share automatically. Payouts are instant and secure.',
    icon: Coins,
    phase: 'payout',
    duration: 'Instant',
    action: 'Receive payout'
  }
];

export interface GameFlowPreviewProps {
  autoPlay?: boolean;
  className?: string;
}

export function GameFlowPreview({ autoPlay = true, className }: GameFlowPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [selectedChoice, setSelectedChoice] = useState<'split' | 'steal' | null>(null);

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % GAME_STEPS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const step = GAME_STEPS[currentStep];

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderStepPreview = () => {
    switch (step.phase) {
      case 'commit':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-ink mb-2">Make Your Choice</h4>
              <p className="text-sm text-ink-dim mb-4">
                Choose wisely - your decision affects the entire community pot
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <ChoiceButton
                choice="split"
                selected={selectedChoice === 'split'}
                onClick={() => setSelectedChoice('split')}
                size="md"
                animated
              />
              <ChoiceButton
                choice="steal"
                selected={selectedChoice === 'steal'}
                onClick={() => setSelectedChoice('steal')}
                size="md"
                animated
              />
            </div>
            {selectedChoice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Pill variant="brand" size="sm" glow>
                  <Lock className="w-3 h-3 mr-1" />
                  Choice Committed Securely
                </Pill>
              </motion.div>
            )}
          </div>
        );

      case 'reveal':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-ink mb-2">Reveal Time</h4>
              <p className="text-sm text-ink-dim mb-4">
                Prove your commitment by revealing your encrypted choice
              </p>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" className="bg-accent/20 border-accent text-accent">
                <Eye className="w-4 h-4 mr-2" />
                Reveal Choice
              </Button>
            </div>
            <div className="text-center">
              <ProgressGlow value={75} variant="accent" size="sm" showValue />
              <p className="text-xs text-ink-dim mt-2">3 of 4 players revealed</p>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-ink mb-2">Round Results</h4>
              <p className="text-sm text-ink-dim mb-4">
                See how the community played
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <Badge variant="brand" size="md" glow>
                  <Shield className="w-4 h-4 mr-1" />
                  3 Split
                </Badge>
                <p className="text-xs text-ink-dim mt-1">Cooperative</p>
              </div>
              <div className="text-center">
                <Badge variant="accent" size="md">
                  <Zap className="w-4 h-4 mr-1" />
                  1 Steal
                </Badge>
                <p className="text-xs text-ink-dim mt-1">Competitive</p>
              </div>
            </div>
            <div className="text-center">
              <Pill variant="success" glow pulse>
                <Trophy className="w-3 h-3 mr-1" />
                Splitters Win!
              </Pill>
            </div>
          </div>
        );

      case 'payout':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-bold text-ink mb-2">Instant Payout</h4>
              <p className="text-sm text-ink-dim mb-4">
                Winners receive their share automatically
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-2xl font-mono font-bold text-brand">
                +$2,500
              </div>
              <Pill variant="success" size="md" glow>
                <CheckCircle className="w-4 h-4 mr-1" />
                Payout Complete
              </Pill>
              <p className="text-xs text-ink-dim">
                Automatically sent to your wallet
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          {GAME_STEPS.map((gameStep, index) => (
            <React.Fragment key={gameStep.id}>
              <motion.button
                onClick={() => handleStepClick(index)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  index === currentStep
                    ? 'bg-brand text-bg shadow-brand-glow'
                    : index < currentStep
                    ? 'bg-brand/30 text-brand'
                    : 'bg-white/10 text-ink-dim hover:bg-white/20'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <gameStep.icon className="w-5 h-5" />
              </motion.button>
              {index < GAME_STEPS.length - 1 && (
                <ArrowRight className="w-4 h-4 text-ink-dim" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Display */}
      <GlassCard className="p-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <step.icon className="w-8 h-8 mx-auto mb-3 text-brand" />
              <h3 className="text-xl font-bold text-ink mb-2">{step.title}</h3>
              <p className="text-ink-dim mb-4">{step.description}</p>
              <div className="flex justify-center space-x-4 text-sm">
                <Pill variant="neutral" size="sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {step.duration}
                </Pill>
                <Pill variant="brand" size="sm">
                  {step.action}
                </Pill>
              </div>
            </div>

            {/* Interactive Preview */}
            <div className="mt-6">
              {renderStepPreview()}
            </div>
          </motion.div>
        </AnimatePresence>
      </GlassCard>

      {/* Play Controls */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handlePlayPause}
          className="bg-glass hover:bg-glass-strong"
        >
          {isPlaying ? 'Pause Tour' : 'Play Tour'}
        </Button>
      </div>
    </div>
  );
}

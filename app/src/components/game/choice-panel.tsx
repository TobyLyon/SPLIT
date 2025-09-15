import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ChoiceButton, Choice } from '@/components/ui/choice-button';
import { Pill } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ChoicePanelProps {
  dayUnix: number;
  hasCommitted: boolean;
  hasRevealed: boolean;
  currentChoice?: Choice | null;
  phase: 'commit' | 'reveal' | 'settled';
  timeLeft?: string;
  onCommit?: (choice: Choice, salt: string) => Promise<void>;
  onReveal?: (choice: Choice, salt: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const ChoicePanel: React.FC<ChoicePanelProps> = ({
  dayUnix,
  hasCommitted,
  hasRevealed,
  currentChoice,
  phase,
  timeLeft,
  onCommit,
  onReveal,
  disabled = false,
  className,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(currentChoice || null);
  const [stakeAmount, setStakeAmount] = useState('1000');
  const [salt, setSalt] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleCommit = async () => {
    if (!selectedChoice || !onCommit || hasCommitted) return;
    
    setIsCommitting(true);
    try {
      // Generate salt if not provided
      const commitSalt = salt || Math.random().toString(36).substring(2, 15);
      await onCommit(selectedChoice, commitSalt);
      setSalt(commitSalt); // Store for reveal
    } catch (error) {
      console.error('Failed to commit choice:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReveal = async () => {
    if (!selectedChoice || !onReveal || !hasCommitted || hasRevealed) return;
    
    setIsRevealing(true);
    try {
      await onReveal(selectedChoice, salt);
    } catch (error) {
      console.error('Failed to reveal choice:', error);
    } finally {
      setIsRevealing(false);
    }
  };

  const getPhaseStatus = () => {
    switch (phase) {
      case 'commit':
        return { 
          label: 'COMMIT PHASE', 
          color: 'brand' as const,
          icon: Lock,
          description: 'Make your choice and commit with stake'
        };
      case 'reveal':
        return { 
          label: 'REVEAL PHASE', 
          color: 'accent' as const,
          icon: Eye,
          description: 'Reveal your committed choice'
        };
      case 'settled':
        return { 
          label: 'SETTLED', 
          color: 'success' as const,
          icon: Unlock,
          description: 'Round complete, payouts distributed'
        };
    }
  };

  const status = getPhaseStatus();
  const StatusIcon = status.icon;

  const canCommit = phase === 'commit' && !hasCommitted && !disabled;
  const canReveal = phase === 'reveal' && hasCommitted && !hasRevealed && !disabled;
  const showChoices = (canCommit || (hasCommitted && !hasRevealed)) && phase !== 'settled';

  return (
    <GlassCard className={cn('p-6 space-y-6', className)}>
      {/* Header with phase status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon className={cn('w-5 h-5', `text-${status.color}`)} />
          <div>
            <h3 className="font-bold text-lg">Daily Choice</h3>
            <p className="text-sm text-ink-dim">{status.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Pill variant={status.color} glow>
            {status.label}
          </Pill>
          {timeLeft && (
            <Pill variant="neutral">
              <Clock className="w-3 h-3 mr-1" />
              {timeLeft}
            </Pill>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Commit Phase */}
        {showChoices && (
          <motion.div
            key="choices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stake Amount (only in commit phase) */}
            {canCommit && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-dim">
                  Stake Amount
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="flex-1"
                    disabled={disabled}
                  />
                  <div className="flex items-center px-3 py-2 glass rounded-lg border border-white/10">
                    <span className="text-brand font-medium">$SPLIT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Choice Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <ChoiceButton
                choice="split"
                selected={selectedChoice === 'split'}
                onClick={() => canCommit && setSelectedChoice('split')}
                size="lg"
                animated
                glow={selectedChoice === 'split'}
                disabled={!canCommit}
              />
              <ChoiceButton
                choice="steal"
                selected={selectedChoice === 'steal'}
                onClick={() => canCommit && setSelectedChoice('steal')}
                size="lg"
                animated
                glow={selectedChoice === 'steal'}
                disabled={!canCommit}
              />
            </div>

            {/* Action Button */}
            {canCommit && selectedChoice && (
              <Button
                onClick={handleCommit}
                disabled={isCommitting || !stakeAmount}
                size="lg"
                className="w-full bg-brand hover:bg-brand/90 text-bg font-bold"
              >
                {isCommitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    <span>Committing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Commit Choice</span>
                  </div>
                )}
              </Button>
            )}

            {canReveal && (
              <Button
                onClick={handleReveal}
                disabled={isRevealing}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold"
              >
                {isRevealing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Revealing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Reveal Choice</span>
                  </div>
                )}
              </Button>
            )}
          </motion.div>
        )}

        {/* Committed State */}
        {hasCommitted && !hasRevealed && phase === 'commit' && (
          <motion.div
            key="committed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 p-6 glass rounded-xl"
          >
            <div className="w-16 h-16 mx-auto bg-brand/20 rounded-full flex items-center justify-center">
              <EyeOff className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-brand mb-2">Choice Committed</h4>
              <p className="text-sm text-ink-dim">
                Your choice is locked in. Wait for the reveal phase to show your decision.
              </p>
            </div>
          </motion.div>
        )}

        {/* Revealed/Settled State */}
        {hasRevealed && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 p-6 glass rounded-xl"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-accent mb-2">Choice Revealed</h4>
                {currentChoice && (
                  <div className="flex justify-center mb-3">
                    <ChoiceButton
                      choice={currentChoice}
                      selected
                      size="md"
                      glow
                      disabled
                    />
                  </div>
                )}
                <p className="text-sm text-ink-dim">
                  {phase === 'settled' 
                    ? 'Round complete! Check your rewards.' 
                    : 'Waiting for round to settle...'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export { ChoicePanel };
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { STAKING_CONFIG } from '@/config/constants';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'stake' | 'unstake';
  squadPubkey: string;
  currentStake: number;
  maxStake: number;
  onStake: (amount: number) => Promise<void>;
  onUnstake: (amount: number) => Promise<void>;
  isLoading: boolean;
}

export function StakingModal({
  isOpen,
  onClose,
  action,
  squadPubkey,
  currentStake,
  maxStake,
  onStake,
  onUnstake,
  isLoading,
}: StakingModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { data: balance } = useWalletBalance();
  
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen, action]);
  
  const numericAmount = parseFloat(amount) || 0;
  const minAmount = STAKING_CONFIG.minStakeAmount / 1_000_000; // Convert to human readable
  
  const validateAmount = () => {
    if (numericAmount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    
    if (numericAmount < minAmount) {
      setError(`Minimum amount is ${minAmount} SPLIT`);
      return false;
    }
    
    if (action === 'stake') {
      if (numericAmount > (balance?.split || 0)) {
        setError('Insufficient balance');
        return false;
      }
    } else {
      if (numericAmount > currentStake) {
        setError('Cannot unstake more than your current stake');
        return false;
      }
    }
    
    setError('');
    return true;
  };
  
  useEffect(() => {
    if (amount) {
      validateAmount();
    } else {
      setError('');
    }
  }, [amount, action, currentStake, balance]);
  
  const handleSubmit = async () => {
    if (!validateAmount()) return;
    
    try {
      if (action === 'stake') {
        await onStake(numericAmount);
      } else {
        await onUnstake(numericAmount);
      }
    } catch (error) {
      console.error('Staking error:', error);
    }
  };
  
  const setPercentage = (percentage: number) => {
    if (action === 'stake') {
      const maxAmount = balance?.split || 0;
      setAmount((maxAmount * percentage / 100).toFixed(2));
    } else {
      setAmount((currentStake * percentage / 100).toFixed(2));
    }
  };
  
  const calculateNewWeight = () => {
    // Simplified weight calculation for preview
    const newStake = action === 'stake' 
      ? currentStake + numericAmount 
      : currentStake - numericAmount;
    
    const baseWeight = newStake;
    const tenureMultiplier = 1.0; // Default for new stakes
    const squadMultiplier = 1.0; // Would need squad size
    const activityMultiplier = 1.0; // Default activity
    
    return baseWeight * tenureMultiplier * squadMultiplier * activityMultiplier;
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card variant="glass-strong" className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {action === 'stake' ? (
                    <Plus className="h-5 w-5 text-brand-mint" />
                  ) : (
                    <Minus className="h-5 w-5 text-brand-violet" />
                  )}
                  <CardTitle>
                    {action === 'stake' ? 'Stake Tokens' : 'Unstake Tokens'}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {action === 'stake' 
                  ? 'Stake SPLIT tokens to earn rewards and increase your squad weight'
                  : 'Unstake your SPLIT tokens back to your wallet'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Current Position */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg glass">
                  <p className="text-sm text-muted-foreground">Current Stake</p>
                  <p className="font-mono text-lg text-brand-mint">
                    {formatNumber(currentStake)} $SPLIT
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg glass">
                  <p className="text-sm text-muted-foreground">
                    {action === 'stake' ? 'Available' : 'Max Unstake'}
                  </p>
                  <p className="font-mono text-lg text-brand-violet">
                    {action === 'stake' 
                      ? formatNumber(balance?.split || 0)
                      : formatNumber(currentStake)
                    } $SPLIT
                  </p>
                </div>
              </div>
              
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 pr-16 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-mint/50 focus:border-brand-mint/50 text-foreground placeholder-muted-foreground font-mono text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge variant="glass" className="text-xs">
                      $SPLIT
                    </Badge>
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percentage) => (
                  <Button
                    key={percentage}
                    variant="glass"
                    size="sm"
                    onClick={() => setPercentage(percentage)}
                    className="text-xs"
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
              
              {/* Preview */}
              {numericAmount > 0 && !error && (
                <Card variant="glass" className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-brand-mint" />
                    <span className="font-medium">Transaction Preview</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {action === 'stake' ? 'New Total Stake' : 'Remaining Stake'}
                      </span>
                      <span className="font-mono text-brand-mint">
                        {formatNumber(
                          action === 'stake' 
                            ? currentStake + numericAmount 
                            : currentStake - numericAmount
                        )} $SPLIT
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Weight</span>
                      <span className="font-mono text-brand-violet">
                        {formatNumber(calculateNewWeight())}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Fee</span>
                      <span className="font-mono text-muted-foreground">
                        ~0.001 SOL
                      </span>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Action Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!amount || !!error || numericAmount <= 0}
                loading={isLoading}
              >
                {isLoading 
                  ? `${action === 'stake' ? 'Staking' : 'Unstaking'}...`
                  : `${action === 'stake' ? 'Stake' : 'Unstake'} ${numericAmount > 0 ? formatNumber(numericAmount) : ''} $SPLIT`
                }
              </Button>
              
              {/* Warning for unstaking */}
              {action === 'unstake' && (
                <div className="flex items-start space-x-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-200">
                    <p className="font-medium mb-1">Unstaking Notice</p>
                    <p>
                      Unstaking tokens will reduce your squad weight and potential rewards. 
                      Consider the impact on your long-term earning potential.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
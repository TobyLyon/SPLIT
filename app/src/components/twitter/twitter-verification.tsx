'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Copy, ExternalLink, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { shortenAddress } from '@/lib/utils';

interface TwitterVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (handle: string, profileUrl: string) => void;
}

type VerificationStep = 'generate' | 'tweet' | 'verify' | 'success';

export function TwitterVerification({ isOpen, onClose, onVerified }: TwitterVerificationProps) {
  const { publicKey } = useWallet();
  const { addNotification } = useNotifications();
  
  const [step, setStep] = useState<VerificationStep>('generate');
  const [nonce, setNonce] = useState('');
  const [tweetUrl, setTweetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  
  const generateNonce = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/twitter-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate proof');
      }
      
      setNonce(data.nonce);
      setVerificationMessage(data.message);
      setExpiresAt(new Date(data.expiresAt));
      setStep('tweet');
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Tweet text copied to clipboard',
      });
    } catch (error) {
      addNotification({
        type: 'info',
        title: 'Copy Failed',
        message: 'Please copy the text manually',
      });
    }
  };
  
  const verifyTweet = async () => {
    if (!publicKey || !tweetUrl || !nonce) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/twitter-proof', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          tweetUrl,
          nonce,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      setStep('success');
      addNotification({
        type: 'success',
        title: 'Twitter Verified!',
        message: `Successfully linked ${data.twitterHandle}`,
      });
      
      onVerified(data.twitterHandle, data.profileUrl);
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setStep('generate');
    setNonce('');
    setTweetUrl('');
    setVerificationMessage('');
    setExpiresAt(null);
  };
  
  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          className="w-full max-w-lg"
        >
          <Card variant="glass-strong">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <CardTitle>Verify Twitter Account</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              </div>
              <CardDescription>
                Link your Twitter account to your wallet for social proof and leaderboard display
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {[
                  { key: 'generate', label: 'Generate', icon: '1' },
                  { key: 'tweet', label: 'Tweet', icon: '2' },
                  { key: 'verify', label: 'Verify', icon: '3' },
                  { key: 'success', label: 'Complete', icon: '✓' },
                ].map((stepItem, index) => (
                  <div key={stepItem.key} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step === stepItem.key 
                        ? 'bg-brand-mint text-brand-dark' 
                        : index < ['generate', 'tweet', 'verify', 'success'].indexOf(step)
                        ? 'bg-brand-mint/20 text-brand-mint'
                        : 'bg-white/10 text-muted-foreground'
                    }`}>
                      {stepItem.icon}
                    </div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        index < ['generate', 'tweet', 'verify', 'success'].indexOf(step)
                          ? 'bg-brand-mint'
                          : 'bg-white/10'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Step Content */}
              <AnimatePresence mode="wait">
                {step === 'generate' && (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Generate Verification Code</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We'll generate a unique code for you to tweet with your wallet address
                      </p>
                      
                      <div className="p-3 rounded-lg glass mb-4">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Wallet:</span>{' '}
                          <span className="font-mono text-brand-mint">
                            {publicKey ? shortenAddress(publicKey.toString()) : 'Not connected'}
                          </span>
                        </p>
                      </div>
                      
                      <Button
                        onClick={generateNonce}
                        loading={isLoading}
                        disabled={!publicKey}
                        className="w-full"
                      >
                        Generate Verification Code
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {step === 'tweet' && (
                  <motion.div
                    key="tweet"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Post Verification Tweet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Copy the message below and post it as a public tweet
                      </p>
                      
                      {expiresAt && (
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <Clock className="h-4 w-4 text-yellow-400" />
                          <Badge variant="glass" className="text-yellow-400">
                            Expires in: {getTimeRemaining()}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <Card variant="glass" className="p-4">
                      <div className="flex items-start justify-between space-x-2">
                        <p className="text-sm font-mono flex-1 leading-relaxed">
                          {verificationMessage}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(verificationMessage)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => window.open('https://twitter.com/intent/tweet', '_blank')}
                        className="flex-1"
                      >
                        <Twitter className="mr-2 h-4 w-4" />
                        Open Twitter
                      </Button>
                      <Button
                        onClick={() => setStep('verify')}
                        className="flex-1"
                      >
                        I've Tweeted
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {step === 'verify' && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Verify Your Tweet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Paste the URL of your tweet below to complete verification
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Tweet URL</label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/username/status/..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-mint/50 focus:border-brand-mint/50 text-foreground placeholder-muted-foreground"
                        value={tweetUrl}
                        onChange={(e) => setTweetUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep('tweet')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={verifyTweet}
                        loading={isLoading}
                        disabled={!tweetUrl}
                        className="flex-1"
                      >
                        Verify Tweet
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Verification Complete!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your Twitter account has been successfully linked to your wallet.
                        You'll now appear on leaderboards with your Twitter handle.
                      </p>
                    </div>
                    
                    <Button onClick={onClose} className="w-full">
                      Continue
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Reset Button */}
              {(step === 'tweet' || step === 'verify') && (
                <Button
                  variant="ghost"
                  onClick={reset}
                  className="w-full text-xs"
                >
                  Start Over
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
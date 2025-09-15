'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Twitter, 
  Copy, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  generateTwitterVerification,
  verifyTwitterAccount,
  checkTwitterVerification,
  TwitterVerificationResult 
} from '@/lib/twitter-auth';

interface TwitterVerificationProps {
  onVerificationComplete?: (result: TwitterVerificationResult) => void;
}

type VerificationStep = 'check' | 'generate' | 'tweet' | 'verify' | 'complete';

export function TwitterVerification({ onVerificationComplete }: TwitterVerificationProps) {
  const { publicKey } = useWallet();
  const { addNotification } = useNotifications();
  
  const [step, setStep] = useState<VerificationStep>('check');
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    token?: string;
    tweetText?: string;
    expiresAt?: Date;
  }>({});
  const [twitterHandle, setTwitterHandle] = useState('');
  const [tweetUrl, setTweetUrl] = useState('');
  const [verificationResult, setVerificationResult] = useState<TwitterVerificationResult | null>(null);

  // Check if already verified
  const checkExistingVerification = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const result = await checkTwitterVerification(publicKey.toBase58());
      if (result.isVerified) {
        setVerificationResult({ success: true, profile: result.profile });
        setStep('complete');
      } else {
        setStep('generate');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      setStep('generate');
    } finally {
      setLoading(false);
    }
  };

  // Generate verification challenge
  const generateChallenge = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const result = await generateTwitterVerification(publicKey.toBase58());
      setVerificationData(result);
      setStep('tweet');
      
      addNotification({
        type: 'info',
        title: 'Verification Challenge Generated',
        message: 'Copy the tweet text and post it on Twitter to verify your account.',
      });
    } catch (error) {
      console.error('Error generating verification:', error);
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: 'Failed to generate verification challenge. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy tweet text to clipboard
  const copyTweetText = async () => {
    if (verificationData.tweetText) {
      await navigator.clipboard.writeText(verificationData.tweetText);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Tweet text copied to clipboard.',
      });
    }
  };

  // Open Twitter to compose tweet
  const openTwitter = () => {
    if (verificationData.tweetText) {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(verificationData.tweetText)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  // Verify Twitter account
  const performVerification = async () => {
    if (!publicKey || !twitterHandle || !tweetUrl) return;
    
    setLoading(true);
    try {
      const result = await verifyTwitterAccount(
        publicKey.toBase58(),
        twitterHandle.replace('@', ''),
        tweetUrl
      );
      
      setVerificationResult(result);
      
      if (result.success) {
        setStep('complete');
        addNotification({
          type: 'success',
          title: 'Twitter Verified!',
          message: 'Your Twitter account has been successfully linked and verified.',
        });
        onVerificationComplete?.(result);
      } else {
        addNotification({
          type: 'error',
          title: 'Verification Failed',
          message: result.error || 'Failed to verify Twitter account.',
        });
      }
    } catch (error) {
      console.error('Error verifying Twitter:', error);
      addNotification({
        type: 'error',
        title: 'Verification Error',
        message: 'An error occurred during verification. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize verification check
  useState(() => {
    if (publicKey && step === 'check') {
      checkExistingVerification();
    }
  });

  if (!publicKey) {
    return (
      <Card variant="glass">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet Required</h3>
          <p className="text-muted-foreground">
            Please connect your Solana wallet to verify your Twitter account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Steps Progress */}
      <div className="flex items-center justify-between">
        {['generate', 'tweet', 'verify', 'complete'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === stepName || (step === 'complete' && index < 3) 
                ? 'bg-brand text-bg' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {step === 'complete' && index < 3 ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && (
              <div className={`
                w-16 h-0.5 mx-2
                ${step === 'complete' || (index === 0 && (step === 'tweet' || step === 'verify' || step === 'complete'))
                  ? 'bg-brand' 
                  : 'bg-muted'
                }
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Link Your Twitter Account
                </CardTitle>
                <CardDescription>
                  Verify your Twitter account to prevent bots and unlock full game features.
                  This is mandatory to participate in Split or Steal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Why Twitter Verification?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Prevents bot accounts and ensures fair gameplay</li>
                    <li>• Enables social features and sharing</li>
                    <li>• Required for community pot claims</li>
                    <li>• Unlocks reputation system and streaks</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={generateChallenge}
                  loading={loading}
                  size="lg"
                  variant="default"
                  className="w-full"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Start Twitter Verification
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'tweet' && (
          <motion.div
            key="tweet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Post Verification Tweet
                </CardTitle>
                <CardDescription>
                  Copy the verification text below and post it as a tweet on your Twitter account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationData.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <Clock className="w-4 h-4" />
                    Expires at {verificationData.expiresAt.toLocaleTimeString()}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tweet Text:</label>
                  <div className="relative">
                    <textarea
                      value={verificationData.tweetText || ''}
                      readOnly
                      className="w-full h-32 px-4 py-3 glass rounded-lg border border-white/10 bg-background/50 resize-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyTweetText}
                      className="absolute top-2 right-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={openTwitter}
                    variant="default"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Post on Twitter
                  </Button>
                  <Button 
                    onClick={() => setStep('verify')}
                    variant="outline"
                  >
                    I've Posted It
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand" />
                  Verify Your Tweet
                </CardTitle>
                <CardDescription>
                  Enter your Twitter handle and the URL of the verification tweet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter Handle</label>
                  <Input
                    placeholder="@yourusername"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tweet URL</label>
                  <Input
                    placeholder="https://twitter.com/yourusername/status/..."
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={performVerification}
                  loading={loading}
                  disabled={!twitterHandle || !tweetUrl}
                  size="lg"
                  variant="default"
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Verify Twitter Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'complete' && verificationResult?.success && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-brand" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">Twitter Verified! 🎉</h3>
                <p className="text-muted-foreground mb-6">
                  Your Twitter account has been successfully linked and verified.
                  You can now participate in all Split or Steal features.
                </p>

                {verificationResult.profile && (
                  <div className="flex items-center justify-center gap-4 p-4 glass rounded-lg">
                    <img 
                      src={verificationResult.profile.avatar_url} 
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-medium">{verificationResult.profile.display_name}</div>
                      <div className="text-sm text-brand">@{verificationResult.profile.twitter_handle}</div>
                    </div>
                    <Badge variant="arcade">Verified</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

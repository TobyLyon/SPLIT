'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowLeft, Users, Image, Hash, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateSquad } from '@/hooks/useBlockchain';
import { useNotifications } from '@/hooks/useNotifications';
import { UI_CONFIG } from '@/config/constants';

export default function CreateSquadPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Blockchain hooks
  const createSquadMutation = useCreateSquad();
  const { addNotification } = useNotifications();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    maxMembers: UI_CONFIG.defaultSquadSize,
    tags: [] as string[],
    isPublic: true,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Available tags for squad categorization
  const availableTags = ['DeFi', 'Gaming', 'NFT', 'Trading', 'Social', 'Education', 'Development'];
  
  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag].slice(0, 5)
    }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connected) {
      router.push('/');
    }
  }, [connected, mounted, router]);

  if (!mounted) {
    return null;
  }

  if (!connected) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Squad name is required';
    } else if (formData.name.length > UI_CONFIG.maxSquadNameLength) {
      newErrors.name = `Squad name must be ${UI_CONFIG.maxSquadNameLength} characters or less`;
    }

    if (formData.maxMembers < UI_CONFIG.minSquadSize || formData.maxMembers > UI_CONFIG.maxSquadSize) {
      newErrors.maxMembers = `Squad size must be between ${UI_CONFIG.minSquadSize} and ${UI_CONFIG.maxSquadSize} members`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!connected || !publicKey) {
      addNotification({
        type: 'error',
        title: 'Wallet Required',
        message: 'Please connect your wallet to create a squad.',
      });
      return;
    }
    
    try {
      await createSquadMutation.mutateAsync({
        name: formData.name.trim(),
        maxMembers: formData.maxMembers,
      });
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to create squad:', error);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient-dual mb-2">
            Create Your Squad
          </h1>
          <p className="text-muted-foreground">
            Set up your squad and start building your staking community.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-brand" />
              <span>Squad Details</span>
            </CardTitle>
            <CardDescription>
              Configure your squad settings and preferences.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Squad Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-brand" />
                  <span>Squad Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your squad name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 text-foreground placeholder-muted-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  maxLength={UI_CONFIG.maxSquadNameLength}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.name && <span className="text-red-400">{errors.name}</span>}</span>
                  <span>{formData.name.length}/{UI_CONFIG.maxSquadNameLength}</span>
                </div>
              </div>

              {/* Max Members */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4 text-brand" />
                  <span>Maximum Members</span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="2"
                    max="8"
                    className="flex-1 accent-brand"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                  />
                  <Badge variant="arcade" className="min-w-[60px] text-center">
                    {formData.maxMembers}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Larger squads get bonus multipliers but require more coordination.
                </p>
                {errors.maxMembers && (
                  <p className="text-xs text-red-400">{errors.maxMembers}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tags <span className="text-xs text-muted-foreground">(Select up to 5)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        formData.tags.includes(tag)
                          ? 'bg-brand text-bg border-brand'
                          : 'bg-white/5 text-muted-foreground border-white/10 hover:border-brand/50'
                      }`}
                      disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      formData.isPublic
                        ? 'bg-brand/10 border-brand text-brand'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                    }`}
                  >
                    <div className="text-sm font-medium">Public</div>
                    <div className="text-xs">Anyone can discover and join</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      !formData.isPublic
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                    }`}
                  >
                    <div className="text-sm font-medium">Private</div>
                    <div className="text-xs">Invite-only access</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={createSquadMutation.isPending || !connected}
                  loading={createSquadMutation.isPending}
                >
                  {createSquadMutation.isPending ? 'Creating Squad...' : 'Create Squad'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Creating a squad requires a small transaction fee (~0.01 SOL)
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>How your squad will appear to others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{formData.name || 'Squad Name'}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>0/{formData.maxMembers} members</span>
                  <Badge variant="mint">Open</Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {formData.description || 'Squad description will appear here...'}
              </p>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="glass" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Flame, 
  Lock, 
  Unlock, 
  Coins,
  Sparkles,
  Eye,
  Check,
  X
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pill } from '@/components/ui/pill';
import { ProgressGlow } from '@/components/ui/progress-glow';
import { cn, formatNumber } from '@/lib/utils';
import { 
  CustomizationItem, 
  CrewCustomization, 
  CrewMember, 
  CrewStats,
  CUSTOMIZATION_ITEMS,
  canUnlockItem 
} from '@/lib/crews';

export interface CrewCustomizationProps {
  currentCustomization: CrewCustomization;
  member: CrewMember;
  crewStats: CrewStats;
  tokenBalance: number;
  onSave: (customization: CrewCustomization, burnAmount?: number) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function CrewCustomization({
  currentCustomization,
  member,
  crewStats,
  tokenBalance,
  onSave,
  onCancel,
  className
}: CrewCustomizationProps) {
  const [customization, setCustomization] = useState<CrewCustomization>(currentCustomization);
  const [selectedCategory, setSelectedCategory] = useState<'icon' | 'banner' | 'color' | 'background' | 'effect'>('icon');
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: 'icon' as const, label: 'Icons', icon: Sparkles },
    { id: 'banner' as const, label: 'Banners', icon: Flame },
    { id: 'color' as const, label: 'Colors', icon: Palette },
    { id: 'background' as const, label: 'Backgrounds', icon: Eye },
    { id: 'effect' as const, label: 'Effects', icon: Coins }
  ];

  const availableItems = CUSTOMIZATION_ITEMS.filter(item => item.category === selectedCategory);
  
  const totalBurnCost = React.useMemo(() => {
    let cost = 0;
    
    // Check each customization option for burn costs
    const iconItem = CUSTOMIZATION_ITEMS.find(item => item.id === customization.icon);
    const bannerItem = CUSTOMIZATION_ITEMS.find(item => item.id === customization.banner);
    
    if (iconItem?.burnCost) cost += iconItem.burnCost;
    if (bannerItem?.burnCost) cost += bannerItem.burnCost;
    
    return cost;
  }, [customization]);

  const totalMultiplier = React.useMemo(() => {
    let multiplier = 1;
    
    const iconItem = CUSTOMIZATION_ITEMS.find(item => item.id === customization.icon);
    const bannerItem = CUSTOMIZATION_ITEMS.find(item => item.id === customization.banner);
    
    if (iconItem?.multiplier) multiplier += (iconItem.multiplier - 1);
    if (bannerItem?.multiplier) multiplier += (bannerItem.multiplier - 1);
    
    return multiplier;
  }, [customization]);

  const handleItemSelect = (item: CustomizationItem) => {
    if (!canUnlockItem(item, member, crewStats)) return;
    
    setCustomization(prev => ({
      ...prev,
      [item.category]: item.id
    }));
  };

  const handleColorChange = (colorType: 'primaryColor' | 'accentColor', color: string) => {
    setCustomization(prev => ({
      ...prev,
      [colorType]: color
    }));
  };

  const handleMottoChange = (motto: string) => {
    setCustomization(prev => ({
      ...prev,
      motto: motto.slice(0, 50) // Limit motto length
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(customization, totalBurnCost > 0 ? totalBurnCost : undefined);
    } catch (error) {
      console.error('Failed to save customization:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      case 'mythic': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getRarityGlow = (rarity: string) => {
    return ['epic', 'legendary', 'mythic'].includes(rarity);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Customize Your Crew</h2>
        <p className="text-ink-dim">
          Unlock new customization options by ranking up and burning tokens for multipliers
        </p>
      </div>

      {/* Preview */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink">Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-glass hover:bg-glass-strong"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>

        {/* Crew Preview */}
        <div 
          className="relative p-6 rounded-2xl border-2 transition-all duration-300"
          style={{
            backgroundColor: customization.primaryColor + '10',
            borderColor: customization.primaryColor + '40',
            background: `linear-gradient(135deg, ${customization.primaryColor}15 0%, ${customization.accentColor}15 100%)`
          }}
        >
          <div className="flex items-center space-x-4">
            {/* Icon Preview */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{
                backgroundColor: customization.primaryColor + '30',
                color: customization.primaryColor,
                border: `2px solid ${customization.primaryColor}60`
              }}
            >
              {customization.icon === 'diamond-hands' ? '💎' : 
               customization.icon === 'skull-basic' ? '💀' :
               customization.icon === 'crown-gold' ? '👑' :
               customization.icon === 'dragon-fire' ? '🐉' :
               customization.icon === 'phoenix' ? '🔥🦅' : '⚡'}
            </div>

            <div>
              <h4 className="text-xl font-bold text-ink">Your Crew Name</h4>
              {customization.motto && (
                <p className="text-ink-dim italic">"{customization.motto}"</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Pill 
                  variant="brand" 
                  size="sm"
                  style={{
                    backgroundColor: customization.accentColor + '30',
                    color: customization.accentColor
                  }}
                >
                  Rating: 95
                </Pill>
                {totalMultiplier > 1 && (
                  <Pill variant="success" size="sm" glow>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {((totalMultiplier - 1) * 100).toFixed(1)}% Bonus
                  </Pill>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Customization Interface */}
      {!previewMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Selection */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-bold text-ink mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'w-full justify-start',
                    selectedCategory === category.id 
                      ? 'bg-brand text-bg' 
                      : 'text-ink-dim hover:text-ink hover:bg-glass'
                  )}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>
          </GlassCard>

          {/* Item Selection */}
          <div className="lg:col-span-2">
            <GlassCard className="p-4">
              <h3 className="text-lg font-bold text-ink mb-4">
                {categories.find(c => c.id === selectedCategory)?.label}
              </h3>
              
              {selectedCategory === 'color' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-dim mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={customization.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="bg-glass border-white/10"
                        placeholder="#34F5C5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-dim mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customization.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={customization.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="bg-glass border-white/10"
                        placeholder="#9B5CFF"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableItems.map((item) => {
                    const isUnlocked = canUnlockItem(item, member, crewStats);
                    const isSelected = customization[item.category as keyof CrewCustomization] === item.id;
                    const canAfford = !item.burnCost || tokenBalance >= item.burnCost;

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                        whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
                      >
                        <GlassCard
                          className={cn(
                            'p-4 cursor-pointer transition-all duration-200 relative',
                            isSelected && 'ring-2 ring-brand shadow-brand-glow',
                            !isUnlocked && 'opacity-50 cursor-not-allowed',
                            getRarityGlow(item.rarity) && isUnlocked && 'shadow-lg'
                          )}
                          style={{
                            borderColor: isSelected ? '#34F5C5' : getRarityColor(item.rarity) + '40',
                            boxShadow: getRarityGlow(item.rarity) && isUnlocked 
                              ? `0 0 20px ${getRarityColor(item.rarity)}30` 
                              : undefined
                          }}
                          onClick={() => isUnlocked && handleItemSelect(item)}
                        >
                          {/* Lock/Unlock Icon */}
                          <div className="absolute top-2 right-2">
                            {isUnlocked ? (
                              isSelected ? (
                                <Check className="w-4 h-4 text-brand" />
                              ) : (
                                <Unlock className="w-4 h-4 text-green-400" />
                              )
                            ) : (
                              <Lock className="w-4 h-4 text-ink-dim" />
                            )}
                          </div>

                          {/* Item Preview */}
                          <div className="text-center mb-3">
                            <div 
                              className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-xl mb-2"
                              style={{ backgroundColor: getRarityColor(item.rarity) + '20' }}
                            >
                              {item.preview}
                            </div>
                            <h4 className="font-medium text-ink text-sm">{item.name}</h4>
                          </div>

                          {/* Rarity Badge */}
                          <div className="flex justify-center mb-2">
                            <Badge
                              variant="neutral"
                              size="sm"
                              style={{ 
                                backgroundColor: getRarityColor(item.rarity) + '20',
                                color: getRarityColor(item.rarity)
                              }}
                            >
                              {item.rarity}
                            </Badge>
                          </div>

                          {/* Burn Cost */}
                          {item.burnCost && (
                            <div className="text-center">
                              <Pill 
                                variant={canAfford ? 'accent' : 'danger'} 
                                size="sm"
                              >
                                <Flame className="w-3 h-3 mr-1" />
                                {formatNumber(item.burnCost)}
                              </Pill>
                            </div>
                          )}

                          {/* Multiplier */}
                          {item.multiplier && (
                            <div className="text-center mt-1">
                              <Pill variant="success" size="sm">
                                <Sparkles className="w-3 h-3 mr-1" />
                                +{((item.multiplier - 1) * 100).toFixed(1)}%
                              </Pill>
                            </div>
                          )}

                          {/* Unlock Requirements */}
                          {!isUnlocked && (
                            <div className="mt-2 text-xs text-ink-dim">
                              {item.unlockRequirements[0]?.description}
                            </div>
                          )}
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* Motto Input */}
      {!previewMode && (
        <GlassCard className="p-4">
          <h3 className="text-lg font-bold text-ink mb-4">Crew Motto</h3>
          <Input
            value={customization.motto || ''}
            onChange={(e) => handleMottoChange(e.target.value)}
            placeholder="Enter your crew's motto (max 50 characters)"
            className="bg-glass border-white/10"
            maxLength={50}
          />
          <p className="text-xs text-ink-dim mt-2">
            {(customization.motto || '').length}/50 characters
          </p>
        </GlassCard>
      )}

      {/* Cost Summary & Actions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-ink">Summary</h3>
            {totalBurnCost > 0 && (
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-ink">Burn Cost: {formatNumber(totalBurnCost)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-ink">Multiplier: +{((totalMultiplier - 1) * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-ink-dim">Your Balance</div>
            <div className="text-xl font-mono font-bold text-ink">
              {formatNumber(tokenBalance)}
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-glass hover:bg-glass-strong"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (totalBurnCost > 0 && tokenBalance < totalBurnCost)}
            className="flex-1 bg-brand hover:bg-brand/90 text-bg"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {totalBurnCost > 0 ? `Burn & Save (${formatNumber(totalBurnCost)})` : 'Save Changes'}
              </>
            )}
          </Button>
        </div>

        {totalBurnCost > tokenBalance && (
          <p className="text-sm text-red-400 mt-2 text-center">
            Insufficient tokens for burn cost
          </p>
        )}
      </GlassCard>
    </div>
  );
}

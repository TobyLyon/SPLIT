'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ASCII_ICONS = [
  'ദ്ദി( • ᴗ - ) ✧',
  '⸜(｡˃ ᵕ ˂ )⸝♡',
  '(ㆆ _ ㆆ)',
  '(づ｡◕‿‿◕｡)づ'
];

export interface AnimatedAsciiProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  interval?: number;
}

export function AnimatedAscii({ 
  className, 
  size = 'xl', 
  glow = true, 
  interval = 2000 
}: AnimatedAsciiProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % ASCII_ICONS.length);
    }, interval);

    return () => clearInterval(timer);
  }, [mounted, interval]);

  if (!mounted) {
    return (
      <div className={cn(
        'font-mono text-center',
        size === 'sm' && 'text-2xl',
        size === 'md' && 'text-4xl',
        size === 'lg' && 'text-6xl',
        size === 'xl' && 'text-6xl md:text-8xl',
        className
      )}>
        {ASCII_ICONS[0]}
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl', 
    lg: 'text-6xl',
    xl: 'text-6xl md:text-8xl'
  };

  return (
    <div className={cn(
      'relative font-mono text-center select-none',
      sizeClasses[size],
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIconIndex}
          className={cn(
            'inline-block',
            glow ? 'text-gradient' : 'text-ink'
          )}
          style={{
            background: 'transparent',
            WebkitBackgroundClip: glow ? 'text' : undefined,
            WebkitTextFillColor: glow ? 'transparent' : undefined,
            backgroundImage: glow ? 'linear-gradient(135deg, rgb(52, 245, 197) 0%, rgb(155, 92, 255) 100%)' : undefined,
            textShadow: glow ? '0 0 10px rgba(52, 245, 197, 0.6), 0 0 20px rgba(155, 92, 255, 0.4)' : undefined
          }}
          initial={{ 
            scale: 0.8,
            opacity: 0,
            filter: 'blur(4px)',
            rotateX: -90
          }}
          animate={{ 
            scale: [0.8, 1.1, 1],
            opacity: [0, 1, 1],
            filter: ['blur(4px)', 'blur(0px)', 'blur(0px)'],
            rotateX: [-90, 10, 0]
          }}
          exit={{ 
            scale: [1, 1.1, 0.8],
            opacity: [1, 1, 0],
            filter: ['blur(0px)', 'blur(0px)', 'blur(4px)'],
            rotateX: [0, -10, 90]
          }}
          transition={{ 
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            times: [0, 0.6, 1]
          }}
        >
          {ASCII_ICONS[currentIconIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

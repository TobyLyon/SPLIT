'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingOrbsProps {
  count?: number;
  className?: string;
}

export function FloatingOrbs({ count = 3, className }: FloatingOrbsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 100, // 100-300px
    x: Math.random() * 100, // 0-100%
    y: Math.random() * 100, // 0-100%
    color: i % 2 === 0 ? 'mint' : 'violet',
    duration: Math.random() * 10 + 15, // 15-25 seconds
    delay: Math.random() * 5, // 0-5 seconds
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full blur-3xl opacity-5 ${
            orb.color === 'mint' ? 'bg-brand-mint' : 'bg-brand-violet'
          }`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            x: ['-50%', '50%', '-50%'],
            y: ['-25%', '25%', '-25%'],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}

// Particle effect for special moments (like successful transactions)
export function ParticleExplosion({ 
  trigger, 
  color = 'mint' 
}: { 
  trigger: boolean; 
  color?: 'mint' | 'violet' 
}) {
  if (!trigger) return null;

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180), // 30 degrees apart
    distance: Math.random() * 100 + 50,
    size: Math.random() * 4 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full ${
            color === 'mint' ? 'bg-brand-mint' : 'bg-brand-violet'
          }`}
          style={{ width: particle.size, height: particle.size }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            opacity: 0,
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Scanning line effect for futuristic loading
export function ScanningLine({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg">
      <motion.div
        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-mint to-transparent"
        initial={{ y: 0, opacity: 0 }}
        animate={{ 
          y: ['0%', '100%', '0%'],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
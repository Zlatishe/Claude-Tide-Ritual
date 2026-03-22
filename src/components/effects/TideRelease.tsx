'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { useJarStore } from '@/stores/jar-store';
import { getShellComponent, type ShellVariant } from '@/components/svg/shells';
import type { ShellColorScheme } from '@/lib/utils/constants';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

type TidePhase = 'idle' | 'rising' | 'peak' | 'receding' | 'stones' | 'toast';

interface TideReleaseProps {
  isActive: boolean;
  inscribedCount: number;
  onShowToast: () => void;
  onComplete: () => void;
  shellVariant?: ShellVariant;
  shellColorScheme?: ShellColorScheme;
}

export function TideRelease({
  isActive,
  inscribedCount,
  onShowToast,
  onComplete,
  shellVariant,
  shellColorScheme,
}: TideReleaseProps) {
  const [phase, setPhase] = useState<TidePhase>('idle');
  const [flyingStones, setFlyingStones] = useState<number[]>([]);
  const addStones = useJarStore((s) => s.addStones);
  const reducedMotion = useReducedMotion();

  // Calculate jar icon target position for stone flight (pixels)
  const jarTarget = useMemo(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const isMd = window.innerWidth >= 768;
    return {
      x: window.innerWidth - (isMd ? 40 : 20) - 18,
      y: (isMd ? 32 : 24) + 24,
    };
  }, []);

  // Pre-compute stone start positions in pixels (stable across renders)
  const stoneStartPositions = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    return Array.from({ length: Math.max(inscribedCount, 1) }, () => ({
      left: (0.4 + Math.random() * 0.2) * vw,
      top: vh + 20,
    }));
  }, [inscribedCount]);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    setPhase('rising');

    // Timeline: rise(0-3s) → peak(3-6.5s) → recede(6.5-10s) → stones(9.5s) → toast(10.8s) → idle(12.3s)
    const t1 = setTimeout(() => setPhase('peak'), 3000);
    const t2 = setTimeout(() => setPhase('receding'), 6500);
    const t3 = setTimeout(() => {
      // ~70% visually receded — sea glass flies from ocean to jar
      setPhase('stones');
      setFlyingStones(Array.from({ length: inscribedCount }, (_, i) => i));
      addStones(inscribedCount);
    }, 9500);
    const t4 = setTimeout(() => {
      // Stones landed — toast appears, sand empty, no shells yet
      setPhase('toast');
      setFlyingStones([]);
      onShowToast();
    }, 10800);
    const t5 = setTimeout(() => {
      // All done — new shells appear
      setPhase('idle');
      onComplete();
    }, 12300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isActive, inscribedCount, onComplete, onShowToast, addStones]);

  const ShellSVG = shellVariant ? getShellComponent(shellVariant) : null;

  // Wave height helpers
  const isUp = phase === 'rising' || phase === 'peak';
  const isReceding = phase === 'receding' || phase === 'stones' || phase === 'toast';

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Wave layer 1 — deepest navy, rises first */}
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{ backgroundColor: '#292E64' }}
            initial={{ height: '0%' }}
            animate={reducedMotion ? { opacity: isUp ? 1 : 0, height: '100%' } : { height: isUp ? '100%' : '0%' }}
            transition={reducedMotion ? { duration: 0.5 } : {
              duration: phase === 'rising' ? 3.0 : isReceding ? 3.5 : 0.3,
              ease: phase === 'rising' ? [0, 0, 0.58, 1] : isReceding ? [0.42, 0, 1, 1] : [0.25, 0.1, 0.25, 1],
            }}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              style={{ height: 80, transform: 'translateY(-100%)' }}
            >
              <path
                d="M0 80 Q 240 20, 480 50 Q 720 80, 960 40 Q 1200 0, 1440 45 L1440 80 Z"
                fill="#292E64"
              />
            </svg>
          </motion.div>

          {/* Wave layer 2 — mid purple */}
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{ backgroundColor: '#3D4690' }}
            initial={{ height: '0%' }}
            animate={reducedMotion ? { opacity: isUp ? 1 : 0, height: '85%' } : { height: isUp ? '85%' : '0%' }}
            transition={reducedMotion ? { duration: 0.5 } : {
              duration: phase === 'rising' ? 3.3 : isReceding ? 3.2 : 0.3,
              ease: phase === 'rising' ? [0, 0, 0.58, 1] : isReceding ? [0.42, 0, 1, 1] : [0.25, 0.1, 0.25, 1],
              delay: phase === 'rising' ? 0.2 : 0,
            }}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 60"
              preserveAspectRatio="none"
              style={{ height: 60, transform: 'translateY(-100%)' }}
            >
              <path
                d="M0 60 Q 360 10, 720 40 Q 1080 60, 1440 25 L1440 60 Z"
                fill="#3D4690"
              />
            </svg>
          </motion.div>

          {/* Wave layer 3 — lavender wash */}
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{ backgroundColor: 'rgba(201,209,255,0.15)' }}
            initial={{ height: '0%' }}
            animate={reducedMotion ? { opacity: isUp ? 1 : 0, height: '70%' } : { height: isUp ? '70%' : '0%' }}
            transition={reducedMotion ? { duration: 0.5 } : {
              duration: phase === 'rising' ? 3.5 : isReceding ? 2.8 : 0.3,
              ease: phase === 'rising' ? [0, 0, 0.58, 1] : isReceding ? [0.42, 0, 1, 1] : [0.25, 0.1, 0.25, 1],
              delay: phase === 'rising' ? 0.4 : 0,
            }}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 50"
              preserveAspectRatio="none"
              style={{ height: 50, transform: 'translateY(-100%)' }}
            >
              <path
                d="M0 50 Q 180 15, 360 35 Q 540 50, 720 20 Q 900 5, 1080 30 Q 1260 50, 1440 25 L1440 50 Z"
                fill="rgba(201,209,255,0.15)"
              />
            </svg>
          </motion.div>

          {/* Floating shell + Breathe out text — shown together at peak (screen fully covered) */}
          {phase === 'peak' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Floating shell */}
              {ShellSVG && shellColorScheme && (
                <motion.div
                  style={{ width: 90, height: 90, marginBottom: 24 }}
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 0.6, scale: 1, y: [0, -10, 0] }}
                  transition={{
                    opacity: { duration: 0.6 },
                    scale: { duration: 0.8 },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <ShellSVG colorScheme={shellColorScheme} className="w-full h-full opacity-50" />
                </motion.div>
              )}

              {/* Breathe out text */}
              <motion.p
                className="text-3xl md:text-4xl font-bold"
                style={{ color: '#C9D1FF' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                Breathe out
              </motion.p>
              <motion.p
                className="mt-3 font-normal"
                style={{ color: 'rgba(201,209,255,0.7)', fontSize: 16 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              >
                The tide is carrying your words away
              </motion.p>
            </motion.div>
          )}

          {/* Flying sea glass — rises from ocean (bottom) to jar icon (top-right) */}
          {phase === 'stones' && flyingStones.map((i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{ backgroundColor: '#E49C75' }}
              initial={{
                left: stoneStartPositions[i]?.left ?? 200,
                top: stoneStartPositions[i]?.top ?? 800,
                scale: 1.2,
                opacity: 0,
              }}
              animate={{
                left: jarTarget.x,
                top: jarTarget.y,
                scale: 0,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.0,
                delay: i * 0.15,
                ease: [0.22, 0.68, 0.36, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

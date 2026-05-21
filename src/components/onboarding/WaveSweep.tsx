'use client';

import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSound } from '@/lib/hooks/use-sound';
import {
  TIDE_LAYER_1,
  TIDE_LAYER_2,
  TIDE_LAYER_3,
  idleEase,
  type LayerConfig,
} from '@/lib/utils/tide-easing';

type SweepPhase = 'idle' | 'rising' | 'peak' | 'receding';

interface WaveSweepProps {
  isActive: boolean;
  onComplete: () => void;
}

export function WaveSweep({ isActive, onComplete }: WaveSweepProps) {
  const [phase, setPhase] = useState<SweepPhase>('idle');
  const reducedMotion = useReducedMotion();
  const { play } = useSound();

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    setPhase('rising');
    play('wave-wash');

    const riseDuration = reducedMotion ? 500 : 3000;
    const peakHold = reducedMotion ? 500 : 1500;
    const recedeDuration = reducedMotion ? 500 : 3500;

    const t1 = setTimeout(() => setPhase('peak'), riseDuration);
    const t2 = setTimeout(() => setPhase('receding'), riseDuration + peakHold);
    const t3 = setTimeout(() => {
      setPhase('idle');
      onComplete();
    }, riseDuration + peakHold + recedeDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onComplete, reducedMotion, play]);

  const isUp = phase === 'rising' || phase === 'peak';
  const isReceding = phase === 'receding';

  function buildTransition(cfg: LayerConfig): Transition {
    if (reducedMotion) return { duration: 0.5 };
    if (phase === 'rising')  return { duration: cfg.rise.duration,   ease: cfg.rise.ease,   delay: cfg.rise.delay };
    if (isReceding)          return { duration: cfg.recede.duration, ease: cfg.recede.ease, delay: cfg.recede.delay };
    return { duration: 0.3, ease: idleEase };
  }

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          {/* Wave layer 1 — deepest navy */}
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{ backgroundColor: '#292E64' }}
            initial={{ height: '0%' }}
            animate={
              reducedMotion
                ? { opacity: isUp ? 1 : 0, height: '100%' }
                : { height: isUp ? '100%' : '0%' }
            }
            transition={buildTransition(TIDE_LAYER_1)}
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
            animate={
              reducedMotion
                ? { opacity: isUp ? 1 : 0, height: '85%' }
                : { height: isUp ? '85%' : '0%' }
            }
            transition={buildTransition(TIDE_LAYER_2)}
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

          {/* Wave layer 3 — lavender wash (foam) */}
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{ backgroundColor: 'rgba(201,209,255,0.15)' }}
            initial={{ height: '0%' }}
            animate={
              reducedMotion
                ? { opacity: isUp ? 1 : 0, height: '70%' }
                : { height: isUp ? '70%' : '0%' }
            }
            transition={buildTransition(TIDE_LAYER_3)}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 50"
              preserveAspectRatio="none"
              style={{ height: 50, transform: 'translateY(-100%)' }}
            >
              <path
                d="M0 50 Q 240 22, 480 40 Q 720 52, 960 32 Q 1200 18, 1440 36 L1440 50 Z"
                fill="rgba(201,209,255,0.15)"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

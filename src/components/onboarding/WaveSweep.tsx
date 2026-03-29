'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSound } from '@/lib/hooks/use-sound';

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
            transition={
              reducedMotion
                ? { duration: 0.5 }
                : {
                    duration: phase === 'rising' ? 3.0 : isReceding ? 3.5 : 0.3,
                    ease:
                      phase === 'rising'
                        ? [0, 0, 0.58, 1]
                        : isReceding
                          ? [0.42, 0, 1, 1]
                          : [0.25, 0.1, 0.25, 1],
                  }
            }
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
            transition={
              reducedMotion
                ? { duration: 0.5 }
                : {
                    duration: phase === 'rising' ? 3.3 : isReceding ? 3.2 : 0.3,
                    ease:
                      phase === 'rising'
                        ? [0, 0, 0.58, 1]
                        : isReceding
                          ? [0.42, 0, 1, 1]
                          : [0.25, 0.1, 0.25, 1],
                    delay: phase === 'rising' ? 0.2 : 0,
                  }
            }
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
            animate={
              reducedMotion
                ? { opacity: isUp ? 1 : 0, height: '70%' }
                : { height: isUp ? '70%' : '0%' }
            }
            transition={
              reducedMotion
                ? { duration: 0.5 }
                : {
                    duration: phase === 'rising' ? 3.5 : isReceding ? 2.8 : 0.3,
                    ease:
                      phase === 'rising'
                        ? [0, 0, 0.58, 1]
                        : isReceding
                          ? [0.42, 0, 1, 1]
                          : [0.25, 0.1, 0.25, 1],
                    delay: phase === 'rising' ? 0.4 : 0,
                  }
            }
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 50"
              preserveAspectRatio="none"
              style={{ height: 50, transform: 'translateY(-100%)' }}
            >
              <path
                d="M0 50 Q 480 0, 960 35 Q 1200 50, 1440 20 L1440 50 Z"
                fill="rgba(201,209,255,0.15)"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

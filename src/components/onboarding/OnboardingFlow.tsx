'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SandSurface } from '@/components/beach/SandSurface';
import { SandParticleCanvas } from '@/components/beach/SandParticleCanvas';
import { WaveComposition } from '@/components/beach/WaveComposition';
import { WaveSweep } from './WaveSweep';
import { SignInScreen } from '@/components/ui/SignInScreen';
import { getShellComponent } from '@/components/svg/shells';
import { SHELL_COLOR_SCHEMES } from '@/lib/utils/constants';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface OnboardingFlowProps {
  onSignIn: () => void;
  isLoading: boolean;
}

export function OnboardingFlow({ onSignIn, isLoading }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();

  const advance = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 4));
  }, []);

  // Auto-advance timers for beach screens (steps 0 and 2)
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(advance, reducedMotion ? 3000 : 4000);
      return () => clearTimeout(t);
    }
    if (step === 2) {
      const t = setTimeout(advance, reducedMotion ? 6000 : 8000);
      return () => clearTimeout(t);
    }
  }, [step, advance, reducedMotion]);

  const handleWaveSweepComplete = useCallback(() => {
    advance();
  }, [advance]);

  const handleSignIn = useCallback(() => {
    localStorage.setItem('tides-onboarding-complete', 'true');
    onSignIn();
  }, [onSignIn]);

  // Tap or keyboard to advance on beach screens (steps 0 and 2)
  const handleAdvance = useCallback(() => {
    if (step === 0 || step === 2) {
      advance();
    }
  }, [step, advance]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAdvance();
      }
    },
    [handleAdvance]
  );

  const ShellSVG = getShellComponent(3);
  const shellColorScheme = SHELL_COLOR_SCHEMES[0];

  // Step 4 is the sign-in screen — render it directly (no beach background)
  if (step === 4) {
    return (
      <SignInScreen
        onSignIn={handleSignIn}
        isLoading={isLoading}
        privacyText="Your words stay on your device. Nothing is saved or sent"
      />
    );
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden cursor-pointer outline-none"
      onClick={handleAdvance}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label={`Onboarding — step ${step + 1} of 5`}
    >
      {/* Persistent beach background */}
      <SandSurface />
      <SandParticleCanvas />

      {/* Step content — fades in/out */}
      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
              style={{ paddingBottom: 'var(--content-bottom)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.p
                className="font-bold text-center"
                style={{
                  color: '#313E88',
                  fontSize: 'clamp(22px, 4vw, 32px)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                The tide comes and goes
              </motion.p>
              <motion.p
                className="font-normal text-center mt-2"
                style={{
                  color: '#313E88',
                  opacity: 0.5,
                  fontSize: 'clamp(16px, 2vw, 18px)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              >
                It always leaves something behind
              </motion.p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8"
              style={{ paddingBottom: 'var(--content-bottom)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Speech bubble — matches "Ready to drift" tag from Shell.tsx */}
              <motion.div className="flex flex-col items-center">
                <motion.div
                  className="px-4 py-1.5 rounded-full font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(201,209,255,0.85)',
                    color: '#313E88',
                    fontSize: 14,
                  }}
                  initial={{ opacity: 0, y: 8, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                >
                  Each shell holds a moment you choose to let go of
                </motion.div>

                {/* Dotted connector — matches Shell.tsx */}
                <div
                  style={{
                    width: 0,
                    height: 12,
                    borderLeft: '1.5px dashed rgba(49,62,136,0.3)',
                    marginTop: 3,
                  }}
                />
              </motion.div>

              {/* Shell */}
              <motion.div
                className="w-24 h-24 md:w-28 md:h-28"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                aria-hidden="true"
              >
                <motion.div
                  animate={
                    reducedMotion
                      ? {}
                      : { y: [0, -4, 0] }
                  }
                  transition={
                    reducedMotion
                      ? {}
                      : {
                          duration: 3.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                  }
                >
                  <ShellSVG colorScheme={shellColorScheme} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom wave composition — persistent */}
      <WaveComposition />

      {/* Wave sweep overlays for steps 1 and 3 */}
      <WaveSweep
        isActive={step === 1 || step === 3}
        onComplete={handleWaveSweepComplete}
      />
    </div>
  );
}

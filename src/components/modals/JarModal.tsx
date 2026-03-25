'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJarStore } from '@/stores/jar-store';
import { getStoneComponent, type StoneVariant } from '@/components/svg/stones';
import { SHELL_COLOR_SCHEMES } from '@/lib/utils/constants';
import { JarBig } from '@/components/svg/jars/JarBig';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';

interface JarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JarModal({ isOpen, onClose }: JarModalProps) {
  const stoneCount = useJarStore((s) => s.stoneCount);
  const stones = useJarStore((s) => s.stones);
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={focusTrapRef}
          className="fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jar-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Full-page opaque navy background */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#292E64' }}
          >
            {/* Close button — top-right, consistent */}
            <button
              className="absolute top-4 right-4 md:top-7 md:right-7 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer z-10"
              style={{ backgroundColor: 'rgba(201,209,255,0.15)', color: '#C9D1FF' }}
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <motion.div
              className="flex flex-col md:flex-row items-center gap-6 md:gap-12 px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Large jar with stones inside */}
              <div className="relative w-[220px] h-[300px] md:w-[440px] md:h-[600px]" aria-hidden="true">
                <JarBig className="w-full h-full" />

                {/* Stones inside jar — positioned at the bottom of the jar body */}
                {stones.map((stone, idx) => {
                  const StoneSVG = getStoneComponent(stone.variant as StoneVariant);
                  const colorScheme = SHELL_COLOR_SCHEMES[stone.colorSeed % SHELL_COLOR_SCHEMES.length];

                  const stoneX = 0.20 + (idx % 5) * 0.15 + (Math.random() * 0.05 - 0.025);
                  const row = Math.floor(idx / 5);
                  const stoneY = 0.85 - row * 0.08 + (Math.random() * 0.03 - 0.015);

                  return (
                    <motion.div
                      key={stone.id}
                      className="absolute"
                      style={{
                        left: `${Math.min(0.80, Math.max(0.20, stoneX)) * 100}%`,
                        top: `${Math.min(0.92, Math.max(0.60, stoneY)) * 100}%`,
                        width: 32 * stone.scale,
                        height: 32 * stone.scale,
                        transform: `translate(-50%, -50%) rotate(${stone.rotation}deg)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.08 * (idx % 10), type: 'spring' }}
                    >
                      <StoneSVG colorScheme={colorScheme} className="w-full h-full" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Text — to the right on desktop, below on mobile */}
              <div className="text-center md:text-left">
                {stoneCount === 0 ? (
                  <>
                    <p id="jar-heading" className="font-medium" style={{ color: 'white', fontSize: 'clamp(24px, 4vw, 48px)' }}>
                      The Treasure Jar
                    </p>
                    <p className="font-normal mt-3" style={{ color: 'rgba(201,209,255,0.6)', fontSize: 16 }}>
                      The tide brings gifts
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'white' }}>
                      <span className="text-5xl md:text-6xl font-bold">{stoneCount}</span>
                    </p>
                    <p id="jar-heading" className="font-medium mt-1" style={{ color: 'white', fontSize: 'clamp(24px, 4vw, 48px)' }}>
                      Thought{stoneCount > 1 ? 's' : ''} released to the tide
                    </p>
                    <p className="font-normal mt-3" style={{ color: 'rgba(201,209,255,0.6)', fontSize: 16 }}>
                      Each piece holds a moment you chose to let go
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

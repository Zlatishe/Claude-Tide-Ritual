'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJarStore } from '@/stores/jar-store';
import { getStoneComponent, type StoneVariant } from '@/components/svg/stones';
import { SHELL_COLOR_SCHEMES } from '@/lib/utils/constants';
import { JarBig } from '@/components/svg/jars/JarBig';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { useSound } from '@/lib/hooks/use-sound';

interface JarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JarModal({ isOpen, onClose }: JarModalProps) {
  const stoneCount = useJarStore((s) => s.stoneCount);
  const stones = useJarStore((s) => s.stones);
  const focusTrapRef = useFocusTrap(isOpen, onClose);
  const { play } = useSound();

  const handleClose = () => {
    play('jar-modal');
    onClose();
  };

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
              onClick={handleClose}
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

                {/* Stones inside jar — organic pile at the bottom */}
                {stones.map((stone, idx) => {
                  const StoneSVG = getStoneComponent(stone.variant as StoneVariant);
                  const colorScheme = SHELL_COLOR_SCHEMES[stone.colorSeed % SHELL_COLOR_SCHEMES.length];

                  // Seeded pseudo-random from stone data (deterministic, no Math.random)
                  const seed1 = ((stone.colorSeed * 9301 + 49297) % 233280) / 233280;
                  const seed2 = ((stone.colorSeed * 7927 + 13849) % 233280) / 233280;
                  const seed3 = (((idx + 1) * 11939 + stone.colorSeed * 3571) % 233280) / 233280;

                  const totalStones = stones.length;

                  // Variable stones per layer: 3, 4, 3, 4... for organic feel
                  const layerPattern = [3, 4, 3, 4, 3, 4, 3, 4, 3, 4];
                  // Calculate which layer this stone falls in
                  let stonesBefore = 0;
                  let layer = 0;
                  while (stonesBefore + layerPattern[layer % layerPattern.length] <= idx) {
                    stonesBefore += layerPattern[layer % layerPattern.length];
                    layer++;
                  }
                  const perLayer = layerPattern[layer % layerPattern.length];
                  const posInLayer = idx - stonesBefore;
                  const stonesInThisLayer = Math.min(perLayer, totalStones - stonesBefore);

                  // Y: bottom of jar ~84%, each layer rises ~6% with jitter
                  const baseY = 0.84 - layer * 0.06;
                  const jitterY = (seed2 - 0.5) * 0.025;
                  const stoneY = Math.max(0.38, Math.min(0.86, baseY + jitterY));

                  // X: spread across jar interior (27%–73%)
                  const xMin = 0.27;
                  const xMax = 0.73;
                  const xSpread = xMax - xMin;
                  const evenSpacing = stonesInThisLayer > 1
                    ? xMin + (posInLayer / (stonesInThisLayer - 1)) * xSpread
                    : 0.5;
                  // Stagger odd layers for a natural pile
                  const layerOffset = layer % 2 === 1 ? xSpread / (perLayer * 2.2) : 0;
                  const jitterX = (seed3 - 0.5) * 0.08;
                  const stoneX = Math.max(xMin, Math.min(xMax, evenSpacing + layerOffset + jitterX));

                  // Stone size scales with jar: 22px on mobile (220px jar), 40px on desktop (440px jar)
                  const baseStoneSize = typeof window !== 'undefined' && window.innerWidth >= 768 ? 40 : 22;
                  const stoneSize = baseStoneSize * (0.9 + seed1 * 0.3);
                  const rot = (seed2 - 0.5) * 45 + stone.rotation * 0.3;

                  return (
                    <motion.div
                      key={stone.id}
                      className="absolute"
                      style={{
                        left: `${stoneX * 100}%`,
                        top: `${stoneY * 100}%`,
                        width: stoneSize,
                        height: stoneSize,
                        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.06 * (idx % 12), type: 'spring' }}
                    >
                      <StoneSVG colorScheme={colorScheme} className="w-full h-full" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Text — to the right on desktop, below on mobile */}
              <div className="text-center md:text-left px-4">
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
                    <p id="jar-heading" className="font-medium mt-1" style={{ color: 'white', fontSize: 'clamp(20px, 4vw, 48px)' }}>
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

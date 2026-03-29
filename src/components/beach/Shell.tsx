'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getShellComponent, SHELL_NAMES, type ShellVariant } from '@/components/svg/shells';
import type { ShellColorScheme } from '@/lib/utils/constants';
import { sandInteraction } from '@/lib/sand-particles/particle-state';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSound } from '@/lib/hooks/use-sound';

interface ShellProps {
  id: string;
  variant: ShellVariant;
  colorScheme: ShellColorScheme;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  isInscribed: boolean;
  index: number;
  onClick: (id: string) => void;
  constraintsRef?: React.RefObject<HTMLDivElement | null>;
}

export function Shell({
  id,
  variant,
  colorScheme,
  x,
  y,
  rotation,
  scale,
  isInscribed,
  index,
  onClick,
  constraintsRef,
}: ShellProps) {
  const ShellSVG = getShellComponent(variant);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const reducedMotion = useReducedMotion();
  const { play, stop } = useSound();
  const [showRipple, setShowRipple] = useState(false);
  const wasDragged = useRef(false);
  const prevInscribed = useRef(isInscribed);
  const draggableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sand ripple + canvas burst when shell becomes inscribed (placed on sand)
  useEffect(() => {
    if (isInscribed && !prevInscribed.current) {
      setShowRipple(true);

      // Trigger canvas particle burst at shell's screen position
      const el = draggableRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        sandInteraction.triggerBurst(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          1.5,
        );
      }

      const timer = setTimeout(() => setShowRipple(false), 1500);
      prevInscribed.current = true;
      return () => clearTimeout(timer);
    }
    prevInscribed.current = isInscribed;
  }, [isInscribed]);

  const baseSize = isMobile ? 85 : 130;
  const size = baseSize * scale;
  const shellLabel = SHELL_NAMES[variant];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(id);
      }
    },
    [onClick, id],
  );

  // Continuously report shell position to particle canvas while dragging.
  // Uses rAF + getBoundingClientRect instead of Framer Motion's onDrag callback
  // because rAF is more reliable across Framer Motion versions.
  useEffect(() => {
    if (!isDragging) return;

    let raf: number;
    const reportPosition = () => {
      const el = draggableRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        sandInteraction.updateDrag(
          id,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
      }
      raf = requestAnimationFrame(reportPosition);
    };
    raf = requestAnimationFrame(reportPosition);

    return () => cancelAnimationFrame(raf);
  }, [isDragging, id]);

  return (
    <div
      className="absolute"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 40 : 1,
      }}
    >
      {/* Drop-in entrance — y translation only, completes and becomes static */}
      <motion.div
        initial={{ y: -35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 180,
          damping: 14,
          delay: index * 0.15,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Scale entrance — separate from y to avoid drag interference */}
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: index * 0.15,
          }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          {/* Draggable container — smooth, bounded to viewport */}
          <motion.div
            ref={draggableRef}
            className="cursor-pointer"
            style={{ width: '100%', height: '100%', position: 'relative' }}
            role="button"
            tabIndex={0}
            aria-label={isInscribed ? `Shell — ${shellLabel} — Ready to drift` : `Shell — ${shellLabel}`}
            onKeyDown={handleKeyDown}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => {
              play('sand-drag');
              setIsDragging(true);
              wasDragged.current = true;
              sandInteraction.startDrag(id, 0, 0, size * 1.2);
            }}
            onDragEnd={() => {
              stop('sand-drag');
              setIsDragging(false);
              sandInteraction.endDrag(id);
              setTimeout(() => {
                wasDragged.current = false;
              }, 100);
            }}
            whileHover={isDragging ? {} : { scale: 1.08 }}
            whileTap={isDragging ? {} : { scale: 0.95 }}
            onClick={() => {
              if (!wasDragged.current) {
                play('shell-tap');
                onClick(id);
              }
            }}
          >
            {/* Sand ripple rings on inscription (shell landing on sand) */}
            {showRipple && (
              <>
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '1.5px solid rgba(228,156,117,0.4)',
                  }}
                  initial={{ width: 15, height: 15, opacity: 0.6 }}
                  animate={{ width: 120, height: 120, opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid rgba(228,156,117,0.3)',
                  }}
                  initial={{ width: 15, height: 15, opacity: 0.5 }}
                  animate={{ width: 80, height: 80, opacity: 0 }}
                  transition={{ duration: 1.0, ease: 'easeOut', delay: 0.15 }}
                />
              </>
            )}

            {/* Peach halo glow — inscribed shells only */}
            {isInscribed && (
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: '-40%',
                  background:
                    'radial-gradient(circle, rgba(218,140,95,0.25) 0%, rgba(228,156,117,0.12) 40%, transparent 65%)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0.6, 0.8, 0.6],
                  scale: [0.97, 1.03, 0.97],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Shell SVG with idle floating + rotation */}
            <motion.div
              animate={
                reducedMotion || isDragging
                  ? { y: 0, rotate: rotation }
                  : {
                      y: [0, -4, 0],
                      rotate: [rotation, rotation + 1.5, rotation - 1.5, rotation],
                    }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 3.5 + (index % 3) * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.3,
                    }
              }
            >
              <ShellSVG colorScheme={colorScheme} className="w-full h-full" />
            </motion.div>

            {/* Ready to drift tag + dotted connector string */}
            {isInscribed && (
              <div
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ bottom: '100%', marginBottom: 4 }}
              >
                <motion.span
                  className="px-4 py-1.5 rounded-full font-medium whitespace-nowrap"
                  style={{
                    fontSize: 14,
                    backgroundColor: 'rgba(201,209,255,0.85)',
                    color: '#313E88',
                  }}
                  initial={{ opacity: 0, y: 8, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  Ready to drift
                </motion.span>
                {/* Dotted string connector */}
                <div
                  style={{
                    width: 0,
                    height: 12,
                    borderLeft: '1.5px dashed rgba(49,62,136,0.3)',
                    marginTop: 3,
                  }}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

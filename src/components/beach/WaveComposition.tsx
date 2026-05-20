'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSandboxStore } from '@/stores/sandbox-store';

interface WaveCompositionProps {
  className?: string;
}

/**
 * Generates a smooth, seamlessly-tiling wave path (filled to bottom).
 *
 * @param harmonic2 — Optional second sine overlaid on the carrier, breaking
 *   the "perfect sine" look that makes waves appear mechanical. Use a
 *   frequency coprime with the carrier (e.g. 7) and low amplitude (2–3px).
 */
function createWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phaseShift: number = 0,
  harmonic2?: { freq: number; amp: number; phase: number },
): string {
  const points: string[] = [];
  const steps = 200;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const angle = (i / steps) * Math.PI * 2 * frequency + phaseShift;
    let y = amplitude * Math.sin(angle);
    if (harmonic2) {
      const angle2 = (i / steps) * Math.PI * 2 * harmonic2.freq + harmonic2.phase;
      y += harmonic2.amp * Math.sin(angle2);
    }
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(amplitude + y).toFixed(2)}`);
  }

  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');

  return points.join(' ');
}

/**
 * Generates a thin stroke-only wave line path (no fill).
 */
function createWaveLinePath(
  width: number,
  amplitude: number,
  frequency: number,
  phaseShift: number = 0,
  yCenter: number = 0,
  harmonic2?: { freq: number; amp: number; phase: number },
): string {
  const points: string[] = [];
  const steps = 200;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const angle = (i / steps) * Math.PI * 2 * frequency + phaseShift;
    let y = yCenter + amplitude * Math.sin(angle);
    if (harmonic2) {
      const angle2 = (i / steps) * Math.PI * 2 * harmonic2.freq + harmonic2.phase;
      y += harmonic2.amp * Math.sin(angle2);
    }
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`);
  }

  return points.join(' ');
}

/**
 * Hook that returns a state cycling through indices [0, 1, ..., length-1]
 * every `durationSec` seconds. Used to drive path-morphing via React state
 * (we swap which precomputed path the <path d=...> renders, instead of
 * trying to animate the SVG `d` attribute through Framer Motion — which
 * has unreliable path-string interpolation).
 */
function useCyclicIndex(length: number, durationSec: number, active: boolean): number {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active || length <= 1) {
      setIdx(0);
      return;
    }
    const stepMs = (durationSec * 1000) / length;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % length);
    }, stepMs);
    return () => clearInterval(id);
  }, [length, durationSec, active]);
  return idx;
}

/** Conditionally wrap children in a breathing scaleY motion.div. */
function MaybeBreathing({
  active,
  keyframes,
  duration,
  children,
}: {
  active: boolean;
  keyframes: number[];
  duration: number;
  children: ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <motion.div
      style={{ transformOrigin: 'bottom center', height: '100%', width: '100%' }}
      animate={{ scaleY: keyframes }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export function WaveComposition({ className }: WaveCompositionProps) {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1600);
  const reducedMotion = useReducedMotion();

  // §4a (organic) — bigger y-bobs + counter-current navy
  const organic = useSandboxStore((s) => s.organicWaveMotion);
  // §4b (morph) — cycle through phase-shifted path snapshots via state
  const morphing = useSandboxStore((s) => s.wavePathMorphing);
  // §4c (harmonic) — overlay high-freq ripple on each wave path
  const harmonic = useSandboxStore((s) => s.waveSecondaryHarmonic);
  // §4d (breathing) — slow scaleY breath per layer, origin at bottom
  const breathing = useSandboxStore((s) => s.waveAmplitudeBreathing);
  // §4e (foam) — independent drifting foam streaks
  const foam = useSandboxStore((s) => s.waveFoamStreaks);

  useEffect(() => {
    setMounted(true);
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Wave tile width — round up to nearest 100 to avoid excessive re-renders
  const W = Math.max(1600, Math.ceil(windowWidth / 100) * 100);

  // harmonic2 params per layer — coprime frequencies to carrier (2) so the
  // ripple doesn't repeat within the tile. Only set when harmonic toggle on.
  const lavHarmonic = harmonic ? { freq: 7, amp: 2.5, phase: 0.5 } : undefined;
  const navHarmonic = harmonic ? { freq: 6, amp: 3.0, phase: 1.1 } : undefined;
  const goldHarmonic = harmonic ? { freq: 9, amp: 1.5, phase: 0.3 } : undefined;

  const lavH = 100;
  const navH = 70;

  // Pre-compute paths. When morphing is on, we use the array of 4 phase
  // snapshots and cycle through them with useCyclicIndex. When off, we
  // just render snapshot 0 (the base path).
  const lavMorphPaths = useMemo(
    () => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((phase) =>
      createWavePath(W, lavH, 10, 2, phase, lavHarmonic),
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, harmonic],
  );
  const navMorphPaths = useMemo(
    () => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((phase) =>
      createWavePath(W, navH, 14, 2, 1.2 + phase, navHarmonic),
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, harmonic],
  );
  const goldMorphPaths = useMemo(
    () => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((phase) =>
      createWaveLinePath(W, 6, 3, 0.8 + phase, 10, goldHarmonic),
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, harmonic],
  );

  // Cycle indices — driven by setInterval state, so the <path d=...> swap
  // is a normal React re-render (no Framer path interpolation needed).
  const morphActive = mounted && !reducedMotion && morphing;
  const lavIdx = useCyclicIndex(lavMorphPaths.length, 14, morphActive);
  const navIdx = useCyclicIndex(navMorphPaths.length, 9, morphActive);
  const goldIdx = useCyclicIndex(goldMorphPaths.length, 11, morphActive);

  const lavPath = lavMorphPaths[lavIdx];
  const navPath = navMorphPaths[navIdx];
  const goldLine = goldMorphPaths[goldIdx];

  if (!mounted) {
    return (
      <div className={`absolute bottom-0 left-0 w-full pointer-events-none ${className ?? ''}`} style={{ height: 'var(--wave-height)' }}>
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 90, background: '#C9D1FF', opacity: 0.7 }} />
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 45, background: '#292E64' }} />
      </div>
    );
  }

  // Foam streak specs — incoherent durations (8 / 11 / 17) so they never align
  const foamStreaks = [
    { bottom: 28, duration: 11, opacity: 0.35, length: 80 },
    { bottom: 44, duration: 17, opacity: 0.25, length: 140 },
    { bottom: 18, duration: 8,  opacity: 0.40, length: 60 },
  ];

  // CSS-transition the d-attribute swaps so they glide instead of snap.
  // We apply transition to the <path> via inline style on its parent <g>.
  // SVG transition on `d` is supported in modern Chrome/Safari/Firefox.
  const pathTransitionStyle: React.CSSProperties = morphActive
    ? { transition: 'd 3.5s ease-in-out' }
    : {};

  const breathingOn = !reducedMotion && breathing;

  return (
    <div
      className={`absolute bottom-0 left-0 w-full pointer-events-none ${className ?? ''}`}
      style={{ height: 'var(--wave-height)', zIndex: 3 }}
      aria-hidden="true"
    >
      {/* 1) Lavender band */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: lavH + 35 }}>
        <MaybeBreathing active={breathingOn} keyframes={[1, 1.12, 1, 0.94, 1]} duration={19}>
          <motion.div
            key={`lav-${W}-${organic ? 'org' : 'lin'}`}
            style={{ display: 'flex', width: W * 2, willChange: 'transform' }}
            animate={
              reducedMotion
                ? { x: 0 }
                : organic
                ? { x: [0, -W], y: [0, -10, 0] }
                : { x: [0, -W] }
            }
            transition={
              reducedMotion
                ? {}
                : organic
                ? {
                    x: { duration: 29, repeat: Infinity, ease: 'linear' },
                    y: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
                  }
                : { duration: 24, repeat: Infinity, ease: 'linear' }
            }
          >
            {[0, 1].map((i) => (
              <svg
                key={i}
                width={W}
                height={lavH}
                viewBox={`0 0 ${W} ${lavH}`}
                preserveAspectRatio="none"
                style={{ flexShrink: 0, display: 'block' }}
              >
                <path d={lavPath} fill="#C9D1FF" fillOpacity={0.7} style={pathTransitionStyle} />
              </svg>
            ))}
          </motion.div>
        </MaybeBreathing>
      </div>

      {/* 2) Dark navy wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: navH + 20 }}>
        <MaybeBreathing active={breathingOn} keyframes={[1, 1.08, 1, 0.96, 1]} duration={13}>
          <motion.div
            key={`nav-${W}-${organic ? 'org' : 'lin'}`}
            style={{
              display: 'flex',
              width: W * 2,
              willChange: 'transform',
              transform: organic ? `translateX(-${W}px)` : undefined,
            }}
            animate={
              reducedMotion
                ? { x: 0 }
                : organic
                ? { x: [-W, 0], y: [0, 8, 0] }
                : { x: [0, -W] }
            }
            transition={
              reducedMotion
                ? {}
                : organic
                ? {
                    x: { duration: 17, repeat: Infinity, ease: 'linear' },
                    y: { duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: -2 },
                  }
                : { duration: 18, repeat: Infinity, ease: 'linear' }
            }
          >
            {[0, 1].map((i) => (
              <svg
                key={i}
                width={W}
                height={navH}
                viewBox={`0 0 ${W} ${navH}`}
                preserveAspectRatio="none"
                style={{ flexShrink: 0, display: 'block' }}
              >
                <path d={navPath} fill="#292E64" style={pathTransitionStyle} />
              </svg>
            ))}
          </motion.div>
        </MaybeBreathing>
      </div>

      {/* 3) Thin gold/terracotta accent line */}
      <div className="absolute left-0 w-full overflow-hidden" style={{ bottom: 55, height: 24 }}>
        <motion.div
          key={`gold-${W}-${organic ? 'org' : 'lin'}`}
          style={{ display: 'flex', width: W * 2, willChange: 'transform' }}
          animate={
            reducedMotion
              ? { x: 0 }
              : organic
              ? { x: [0, -W], y: [0, -5, 3, 0] }
              : { x: [0, -W] }
          }
          transition={
            reducedMotion
              ? {}
              : organic
              ? {
                  x: { duration: 23, repeat: Infinity, ease: 'linear' },
                  y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
                }
              : { duration: 20, repeat: Infinity, ease: 'linear' }
          }
        >
          {[0, 1].map((i) => (
            <svg
              key={i}
              width={W}
              height={24}
              viewBox={`0 0 ${W} 24`}
              preserveAspectRatio="none"
              style={{ flexShrink: 0, display: 'block' }}
            >
              <path
                d={goldLine}
                fill="none"
                stroke="#E49C75"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={pathTransitionStyle}
              />
            </svg>
          ))}
        </motion.div>
      </div>

      {/* Solid fill at very bottom to prevent gaps */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: 28, background: '#292E64' }} />

      {/* §4e — Foam streaks: thin bright lines drifting across the wave face
          at incoherent durations (8 / 11 / 17). Skip under reduced motion. */}
      {!reducedMotion && foam && foamStreaks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            bottom: s.bottom,
            left: -s.length,
            height: 1,
            width: s.length,
            opacity: s.opacity,
            background: 'rgba(255,255,255,0.75)',
            borderRadius: 1,
            filter: 'blur(0.5px)',
          }}
          animate={{ x: [0, windowWidth + s.length] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

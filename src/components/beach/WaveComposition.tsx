'use client';

import { useState, useEffect, useMemo } from 'react';
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

export function WaveComposition({ className }: WaveCompositionProps) {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1600);
  const reducedMotion = useReducedMotion();

  // §4a (organic) — bigger y-bobs + counter-current navy
  const organic = useSandboxStore((s) => s.organicWaveMotion);
  // §4b (morph) — animate SVG path 'd' through phase-shifted keyframes
  const morphing = useSandboxStore((s) => s.wavePathMorphing);
  // §4c (harmonic) — overlay high-freq ripple on each wave path
  const harmonic = useSandboxStore((s) => s.waveSecondaryHarmonic);
  // §4d (breathing) — slow scaleY breath per layer, origin at bottom
  const breathing = useSandboxStore((s) => s.waveAmplitudeBreathing);
  // §4e (foam) — independent drifting foam streaks on the wave surface
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

  // --- Path generation ---
  // harmonic2 params per layer — coprime frequencies to carrier so ripples
  // don't repeat within a tile. Only applied when `harmonic` toggle is on.
  const lavHarmonic = harmonic ? { freq: 7, amp: 2.5, phase: 0.5 } : undefined;
  const navHarmonic = harmonic ? { freq: 6, amp: 3.0, phase: 1.1 } : undefined;
  const goldHarmonic = harmonic ? { freq: 9, amp: 1.5, phase: 0.3 } : undefined;

  // Lavender wave dimensions
  const lavH = 100;
  // Navy wave dimensions
  const navH = 70;

  // Base paths (used for static rendering + non-morphing fallback)
  const lavPath = useMemo(
    () => createWavePath(W, lavH, 10, 2, 0, lavHarmonic),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, harmonic],
  );
  const navPath = useMemo(
    () => createWavePath(W, navH, 14, 2, 1.2, navHarmonic),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, harmonic],
  );
  const goldLine = useMemo(
    () => createWaveLinePath(W, 6, 3, 0.8, 10, goldHarmonic),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, harmonic],
  );

  // §4b — 4-keyframe phase arrays for path morphing.
  // We step through π/2 increments so the crests glide visibly.
  // Same point count (200 steps) guarantees Framer can interpolate per-point.
  const lavMorphPaths = useMemo(() => [
    createWavePath(W, lavH, 10, 2, 0, lavHarmonic),
    createWavePath(W, lavH, 10, 2, Math.PI / 2, lavHarmonic),
    createWavePath(W, lavH, 10, 2, Math.PI, lavHarmonic),
    createWavePath(W, lavH, 10, 2, (3 * Math.PI) / 2, lavHarmonic),
    createWavePath(W, lavH, 10, 2, 0, lavHarmonic),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [W, harmonic]);

  const navMorphPaths = useMemo(() => [
    createWavePath(W, navH, 14, 2, 1.2, navHarmonic),
    createWavePath(W, navH, 14, 2, 1.2 + Math.PI / 2, navHarmonic),
    createWavePath(W, navH, 14, 2, 1.2 + Math.PI, navHarmonic),
    createWavePath(W, navH, 14, 2, 1.2 + (3 * Math.PI) / 2, navHarmonic),
    createWavePath(W, navH, 14, 2, 1.2, navHarmonic),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [W, harmonic]);

  const goldMorphPaths = useMemo(() => [
    createWaveLinePath(W, 6, 3, 0.8, 10, goldHarmonic),
    createWaveLinePath(W, 6, 3, 0.8 + Math.PI / 2, 10, goldHarmonic),
    createWaveLinePath(W, 6, 3, 0.8 + Math.PI, 10, goldHarmonic),
    createWaveLinePath(W, 6, 3, 0.8 + (3 * Math.PI) / 2, 10, goldHarmonic),
    createWaveLinePath(W, 6, 3, 0.8, 10, goldHarmonic),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [W, harmonic]);

  if (!mounted) {
    return (
      <div className={`absolute bottom-0 left-0 w-full pointer-events-none ${className ?? ''}`} style={{ height: 'var(--wave-height)' }}>
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 90, background: '#C9D1FF', opacity: 0.7 }} />
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 45, background: '#292E64' }} />
      </div>
    );
  }

  // Foam streak specs — independent drifting "foam lines" on the wave surface.
  // Three streaks with incoherent durations so they never align visually.
  const foamStreaks = [
    { bottom: 28, duration: 11, opacity: 0.35, length: 80 },
    { bottom: 44, duration: 17, opacity: 0.25, length: 140 },
    { bottom: 18, duration: 8,  opacity: 0.40, length: 60 },
  ];

  return (
    <div
      className={`absolute bottom-0 left-0 w-full pointer-events-none ${className ?? ''}`}
      style={{ height: 'var(--wave-height)', zIndex: 3 }}
      aria-hidden="true"
    >
      {/* 1) Lavender band — bottom-most, widest, gentle sway */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: lavH + 35 }}>
        {/* §4d breathing wrapper — scaleY anchored at bottom */}
        <motion.div
          style={{ transformOrigin: 'bottom center', height: '100%', width: '100%' }}
          animate={!reducedMotion && breathing ? { scaleY: [1, 1.12, 1, 0.94, 1] } : { scaleY: 1 }}
          transition={!reducedMotion && breathing
            ? { duration: 19, repeat: Infinity, ease: 'easeInOut' }
            : {}}
        >
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
                {/* §4b morphing path */}
                <motion.path
                  d={lavPath}
                  fill="#C9D1FF"
                  fillOpacity={0.7}
                  animate={!reducedMotion && morphing
                    ? { d: lavMorphPaths }
                    : { d: lavPath }}
                  transition={!reducedMotion && morphing
                    ? { duration: 14, repeat: Infinity, ease: 'easeInOut' }
                    : {}}
                />
              </svg>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* 2) Dark navy wave — on top, stronger amplitude
          (organic: counter-currents — moves right instead of left) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: navH + 20 }}>
        <motion.div
          style={{ transformOrigin: 'bottom center', height: '100%', width: '100%' }}
          animate={!reducedMotion && breathing ? { scaleY: [1, 1.08, 1, 0.96, 1] } : { scaleY: 1 }}
          transition={!reducedMotion && breathing
            ? { duration: 13, repeat: Infinity, ease: 'easeInOut' }
            : {}}
        >
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
                <motion.path
                  d={navPath}
                  fill="#292E64"
                  animate={!reducedMotion && morphing
                    ? { d: navMorphPaths }
                    : { d: navPath }}
                  transition={!reducedMotion && morphing
                    ? { duration: 9, repeat: Infinity, ease: 'easeInOut' }
                    : {}}
                />
              </svg>
            ))}
          </motion.div>
        </motion.div>
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
              <motion.path
                d={goldLine}
                fill="none"
                stroke="#E49C75"
                strokeLinecap="round"
                animate={!reducedMotion && morphing
                  ? { d: goldMorphPaths, strokeWidth: [1.5, 1.8, 1.3, 1.8, 1.5] }
                  : { d: goldLine, strokeWidth: 1.5 }}
                transition={!reducedMotion && morphing
                  ? {
                      d: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
                      strokeWidth: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
                    }
                  : {}}
              />
            </svg>
          ))}
        </motion.div>
      </div>

      {/* Solid fill at very bottom to prevent gaps */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: 28, background: '#292E64' }} />

      {/* §4e — Foam streaks: thin bright lines drifting across the wave face
          at incoherent durations (11s / 17s / 8s — no common factor). Each
          reads as foam catching the light. Only shown when not reducedMotion. */}
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

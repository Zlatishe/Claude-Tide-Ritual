'use client';

import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { useJarStore } from '@/stores/jar-store';
import { useSandboxStore } from '@/stores/sandbox-store';
import { getShellComponent, type ShellVariant } from '@/components/svg/shells';
import type { ShellColorScheme } from '@/lib/utils/constants';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSound } from '@/lib/hooks/use-sound';

type TidePhase = 'idle' | 'rising' | 'peak' | 'receding' | 'stones' | 'toast';

interface TideReleaseProps {
  isActive: boolean;
  inscribedCount: number;
  onShowToast: () => void;
  onComplete: () => void;
  shellVariant?: ShellVariant;
  shellColorScheme?: ShellColorScheme;
}

// ────────────────────────────────────────────────────────────────────────────
// FIX-03 §4 helpers — wave-crest path generation and morphing.
//
// The TideRelease wave is rendered as 3 motion.divs (background-color
// rectangles) that animate their `height` from 0% to a target%. A static
// SVG sits at the top of each rectangle (translateY(-100%)) and draws the
// wave silhouette, giving the illusion of a wavy top edge as the rectangle
// inflates upward. The default crest paths are static hand-drawn Q-curves;
// `tideHarmonicCrests` swaps them for sine-generated ones with a high-freq
// secondary harmonic overlaid (real-water silhouette, less mechanical).
// ────────────────────────────────────────────────────────────────────────────

/**
 * Generates a crest path for the top of a TideRelease wave layer.
 * The viewBox is `0 0 width height`; the path draws a sine across the
 * top half, then closes back down to fill the SVG. The colored fill
 * blends seamlessly with the rectangle below it.
 */
function createTideCrest(
  width: number,
  height: number,
  crestCount: number,
  amplitude: number,
  phaseShift: number = 0,
  harmonic2?: { freq: number; amp: number; phase: number },
): string {
  const steps = 80;
  const points: string[] = [];
  // Wave centerline sits at amplitude (so peaks reach 0, troughs reach 2*amp).
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const angle = (i / steps) * Math.PI * 2 * crestCount + phaseShift;
    let y = amplitude * Math.sin(angle);
    if (harmonic2) {
      const a2 = (i / steps) * Math.PI * 2 * harmonic2.freq + harmonic2.phase;
      y += harmonic2.amp * Math.sin(a2);
    }
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(amplitude + y).toFixed(2)}`);
  }
  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');
  return points.join(' ');
}

/**
 * Cycles through indices [0..length-1] at a fixed period. Used to drive
 * crest morphing — each tick swaps which precomputed path the <path d=...>
 * renders. We use React state + setInterval (not Framer Motion's path
 * interpolation), so the morph is a normal re-render. CSS handles the
 * smooth transition between the snapshots via `transition: d ...`.
 */
function useCyclicIndex(length: number, durationSec: number, active: boolean): number {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active || length <= 1) {
      setIdx(0);
      return;
    }
    const stepMs = (durationSec * 1000) / length;
    const id = setInterval(() => setIdx((i) => (i + 1) % length), stepMs);
    return () => clearInterval(id);
  }, [length, durationSec, active]);
  return idx;
}

// Static fallback crest paths (the original hand-tuned Q-curves).
const STATIC_CRESTS = {
  navy: 'M0 80 Q 240 20, 480 50 Q 720 80, 960 40 Q 1200 0, 1440 45 L1440 80 Z',
  mid:  'M0 60 Q 360 10, 720 40 Q 1080 60, 1440 25 L1440 60 Z',
  lav:  'M0 50 Q 180 15, 360 35 Q 540 50, 720 20 Q 900 5, 1080 30 Q 1260 50, 1440 25 L1440 50 Z',
};

// Generated harmonic crests — base snapshot (phase 0). When morphing is on
// we generate 4 more phase-shifted snapshots and cycle through them.
const CREST_PARAMS = {
  navy: { width: 1440, height: 80, crestCount: 3, amplitude: 25, harmonic2: { freq: 11, amp: 4,   phase: 0.3 } },
  mid:  { width: 1440, height: 60, crestCount: 2, amplitude: 20, harmonic2: { freq: 9,  amp: 3,   phase: 0.7 } },
  lav:  { width: 1440, height: 50, crestCount: 4, amplitude: 16, harmonic2: { freq: 13, amp: 2.5, phase: 1.1 } },
};

function buildCrestSnapshots(layer: 'navy' | 'mid' | 'lav', morphing: boolean): string[] {
  const p = CREST_PARAMS[layer];
  if (!morphing) {
    return [createTideCrest(p.width, p.height, p.crestCount, p.amplitude, 0, p.harmonic2)];
  }
  return [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((phase) =>
    createTideCrest(p.width, p.height, p.crestCount, p.amplitude, phase, p.harmonic2),
  );
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
  const [vw, setVw] = useState(1440);
  const addStones = useJarStore((s) => s.addStones);
  const reducedMotion = useReducedMotion();
  const { play } = useSound();

  // FIX-03 §4 — tide experiment toggles
  const harmonic = useSandboxStore((s) => s.tideHarmonicCrests);
  const staggered = useSandboxStore((s) => s.tideStaggeredEasing);
  const lateralSwell = useSandboxStore((s) => s.tideLateralSwell);
  const morphing = useSandboxStore((s) => s.tideCrestMorphing);
  const foam = useSandboxStore((s) => s.tideFoamStreaks);
  const peakBob = useSandboxStore((s) => s.tidePeakBobbing);

  // Capture viewport width for lateral-swell calculation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return Array.from({ length: Math.max(inscribedCount, 1) }, () => ({
      left: (0.4 + Math.random() * 0.2) * w,
      top: h + 20,
    }));
  }, [inscribedCount]);

  // Pre-compute crest snapshots per layer. Morphing requires harmonic (the
  // static Q-curve strings have no phase to shift).
  const morphActive = morphing && harmonic && !reducedMotion;
  const navySnapshots = useMemo(
    () => (harmonic ? buildCrestSnapshots('navy', morphActive) : [STATIC_CRESTS.navy]),
    [harmonic, morphActive],
  );
  const midSnapshots = useMemo(
    () => (harmonic ? buildCrestSnapshots('mid', morphActive) : [STATIC_CRESTS.mid]),
    [harmonic, morphActive],
  );
  const lavSnapshots = useMemo(
    () => (harmonic ? buildCrestSnapshots('lav', morphActive) : [STATIC_CRESTS.lav]),
    [harmonic, morphActive],
  );

  // Cycle through snapshots on independent periods (no LCM-friendly numbers
  // means the visual pattern doesn't lock into a noticeable loop).
  const navyIdx = useCyclicIndex(navySnapshots.length, 4.5, morphActive);
  const midIdx  = useCyclicIndex(midSnapshots.length,  3.5, morphActive);
  const lavIdx  = useCyclicIndex(lavSnapshots.length,  2.8, morphActive);

  const navyD = navySnapshots[navyIdx] ?? STATIC_CRESTS.navy;
  const midD  = midSnapshots[midIdx]   ?? STATIC_CRESTS.mid;
  const lavD  = lavSnapshots[lavIdx]   ?? STATIC_CRESTS.lav;

  // CSS transition string for the SVG path `d` attribute. Modern Chrome 78+
  // and Safari 16+ natively interpolate `d` between values when its attribute
  // changes — zero JS interpolation needed, smoother than Framer's path tween.
  const dTransitionStyle: React.CSSProperties = morphActive
    ? { transition: 'd 1500ms ease-in-out' }
    : {};

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    setPhase('rising');
    play('wave-wash');

    // Timeline: rise(0-3s) → peak(3-6.5s) → recede(6.5-10s) → stones(9.5s) → toast(10.8s) → idle(12.3s)
    const t1 = setTimeout(() => setPhase('peak'), 3000);
    const t2 = setTimeout(() => setPhase('receding'), 6500);
    const t3 = setTimeout(() => {
      play('stone-added');
      setPhase('stones');
      setFlyingStones(Array.from({ length: inscribedCount }, (_, i) => i));
      addStones(inscribedCount);
    }, 9500);
    const t4 = setTimeout(() => {
      setPhase('toast');
      setFlyingStones([]);
      onShowToast();
    }, 10800);
    const t5 = setTimeout(() => {
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
  }, [isActive, inscribedCount, onComplete, onShowToast, addStones, play]);

  const ShellSVG = shellVariant ? getShellComponent(shellVariant) : null;

  // Wave height helpers
  const isUp = phase === 'rising' || phase === 'peak';
  const isReceding = phase === 'receding' || phase === 'stones' || phase === 'toast';

  // ──────────────────────────────────────────────────────────────────────────
  // Easing / transition selection per layer.
  //
  // When `staggered` is OFF, all layers share the original cubic-bezier
  // easing — they only differ by duration and delay. Reads as "one mass
  // staggered." When ON, each layer gets a distinct gesture:
  //   - Layer 1 navy: original cubic ease-out (the wave body)
  //   - Layer 2 mid:  easeOut rising (sharper push) → linear receding (steady drain)
  //   - Layer 3 lav:  spring rising (overshoot + settle) → ease-in-out receding
  // ──────────────────────────────────────────────────────────────────────────

  // All easings as cubic-bezier tuples (avoids type widening of string names).
  const easeOutDefault: [number, number, number, number] = [0, 0, 0.58, 1];
  const easeInDefault: [number, number, number, number] = [0.42, 0, 1, 1];
  const easeInOut: [number, number, number, number] = [0.42, 0, 0.58, 1];
  const easeOutSharp: [number, number, number, number] = [0, 0, 0.2, 1];
  const linear: [number, number, number, number] = [0, 0, 1, 1];
  const idleEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

  // Layer 1 — navy
  const layer1Transition: Transition = reducedMotion
    ? { duration: 0.5 }
    : {
        duration: phase === 'rising' ? 3.0 : isReceding ? 3.5 : 0.3,
        ease: phase === 'rising' ? easeOutDefault : isReceding ? easeInDefault : idleEase,
      };

  // Layer 2 — mid purple. Lateral swell adds `x` keyframe during rise only.
  const layer2RiseDuration = 3.3;
  const layer2Transition: Transition = reducedMotion
    ? { duration: 0.5 }
    : staggered
    ? {
        duration: phase === 'rising' ? layer2RiseDuration : isReceding ? 3.2 : 0.3,
        ease: phase === 'rising' ? easeOutSharp : isReceding ? linear : idleEase,
        delay: phase === 'rising' ? 0.2 : 0,
        ...(lateralSwell && phase === 'rising'
          ? { x: { duration: 1.0, ease: easeOutDefault } }
          : {}),
      }
    : {
        duration: phase === 'rising' ? layer2RiseDuration : isReceding ? 3.2 : 0.3,
        ease: phase === 'rising' ? easeOutDefault : isReceding ? easeInDefault : idleEase,
        delay: phase === 'rising' ? 0.2 : 0,
        ...(lateralSwell && phase === 'rising'
          ? { x: { duration: 1.0, ease: easeOutDefault } }
          : {}),
      };

  // Layer 3 — lavender wash. When staggered, rise uses a spring (overshoot).
  // Framer ignores `duration` on type: 'spring' — physics determines timing.
  const layer3Transition: Transition = reducedMotion
    ? { duration: 0.5 }
    : staggered
    ? phase === 'rising'
      ? { type: 'spring', stiffness: 60, damping: 12, mass: 1.4, delay: 0.4 }
      : isReceding
      ? { duration: 2.8, ease: [0.4, 0, 0.2, 1] }
      : { duration: 0.3, ease: idleEase }
    : {
        duration: phase === 'rising' ? 3.5 : isReceding ? 2.8 : 0.3,
        ease: phase === 'rising' ? easeOutDefault : isReceding ? easeInDefault : idleEase,
        delay: phase === 'rising' ? 0.4 : 0,
      };

  // Lateral-swell x-value for layer 2 (only during rise).
  const layer2X = !reducedMotion && lateralSwell && phase === 'rising'
    ? [-Math.round(vw * 0.05), 0]
    : 0;

  // Peak-bobbing y-keyframes per layer (only during peak).
  const peakBobActive = !reducedMotion && peakBob && phase === 'peak';
  const layer1PeakY = peakBobActive ? [0, -3, 0, 3, 0] : 0;
  const layer2PeakY = peakBobActive ? [0, 3, 0, -2, 0] : 0;
  const peakBobTransition: Transition = peakBobActive
    ? { y: { duration: 5, repeat: Infinity, ease: easeInOut } }
    : {};

  // Foam streak specs — incoherent durations so they never align visually
  const foamStreaks = [
    { topPercent: 25, duration: 11, opacity: 0.4, length: 120 },
    { topPercent: 38, duration: 17, opacity: 0.3, length: 200 },
    { topPercent: 48, duration: 8,  opacity: 0.5, length: 80 },
  ];

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
            animate={
              reducedMotion
                ? { opacity: isUp ? 1 : 0, height: '100%' }
                : { height: isUp ? '100%' : '0%', y: layer1PeakY }
            }
            transition={{ ...layer1Transition, ...peakBobTransition }}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              style={{ height: 80, transform: 'translateY(-100%)' }}
            >
              <path d={navyD} fill="#292E64" style={dTransitionStyle} />
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
                : { height: isUp ? '85%' : '0%', x: layer2X, y: layer2PeakY }
            }
            transition={{ ...layer2Transition, ...peakBobTransition }}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 60"
              preserveAspectRatio="none"
              style={{ height: 60, transform: 'translateY(-100%)' }}
            >
              <path d={midD} fill="#3D4690" style={dTransitionStyle} />
            </svg>
          </motion.div>

          {/* Wave layer 3 — lavender wash */}
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{ backgroundColor: 'rgba(201,209,255,0.15)' }}
            initial={{ height: '0%' }}
            animate={reducedMotion ? { opacity: isUp ? 1 : 0, height: '70%' } : { height: isUp ? '70%' : '0%' }}
            transition={layer3Transition}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 1440 50"
              preserveAspectRatio="none"
              style={{ height: 50, transform: 'translateY(-100%)' }}
            >
              <path d={lavD} fill="rgba(201,209,255,0.15)" style={dTransitionStyle} />
            </svg>
          </motion.div>

          {/* §4e Foam streaks — only during peak, only when toggle on */}
          {!reducedMotion && foam && phase === 'peak' && (
            <>
              {foamStreaks.map((s, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${s.topPercent}%`,
                    left: -s.length,
                    height: 1.5,
                    width: s.length,
                    opacity: s.opacity,
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 1,
                    filter: 'blur(0.5px)',
                  }}
                  animate={{ x: [0, vw + s.length] }}
                  transition={{ duration: s.duration, repeat: Infinity, ease: 'linear' }}
                />
              ))}
            </>
          )}

          {/* Floating shell + Breathe out text — shown at peak (screen covered) */}
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
                className="t-h1"
                style={{ color: '#C9D1FF' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                Breathe out
              </motion.p>
              <motion.p
                className="t-support mt-2"
                style={{ color: 'var(--text-secondary-dark)' }}
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

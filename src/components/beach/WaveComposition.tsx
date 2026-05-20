'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface WaveCompositionProps {
  className?: string;
}

/**
 * Ambient bottom-of-screen wave. Three layers (lavender / navy / gold accent)
 * slide horizontally at slightly different speeds for parallax. Deliberately
 * calm — this is background motion, not an event. Event-tier wave organicness
 * lives in TideRelease (the wash-away climax), not here.
 */

function createWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phaseShift: number = 0,
): string {
  const points: string[] = [];
  const steps = 200;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const angle = (i / steps) * Math.PI * 2 * frequency + phaseShift;
    const y = amplitude * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(amplitude + y).toFixed(2)}`);
  }

  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');

  return points.join(' ');
}

function createWaveLinePath(
  width: number,
  amplitude: number,
  frequency: number,
  phaseShift: number = 0,
  yCenter: number = 0,
): string {
  const points: string[] = [];
  const steps = 200;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const angle = (i / steps) * Math.PI * 2 * frequency + phaseShift;
    const y = yCenter + amplitude * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`);
  }

  return points.join(' ');
}

export function WaveComposition({ className }: WaveCompositionProps) {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1600);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!mounted) {
    return (
      <div className={`absolute bottom-0 left-0 w-full pointer-events-none ${className ?? ''}`} style={{ height: 'var(--wave-height)' }}>
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 90, background: '#C9D1FF', opacity: 0.7 }} />
        <div className="absolute bottom-0 left-0 w-full" style={{ height: 45, background: '#292E64' }} />
      </div>
    );
  }

  // Wave tile width — round up to nearest 100 to limit re-renders
  const W = Math.max(1600, Math.ceil(windowWidth / 100) * 100);

  const lavH = 100;
  const lavPath = createWavePath(W, lavH, 10, 2, 0);

  const navH = 70;
  const navPath = createWavePath(W, navH, 14, 2, 1.2);

  const goldLine = createWaveLinePath(W, 6, 3, 0.8, 10);

  return (
    <div
      className={`absolute bottom-0 left-0 w-full pointer-events-none ${className ?? ''}`}
      style={{ height: 'var(--wave-height)', zIndex: 3 }}
      aria-hidden="true"
    >
      {/* 1) Lavender band — bottom-most, widest */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: lavH + 25 }}>
        <motion.div
          key={`lav-${W}`}
          style={{ display: 'flex', width: W * 2, willChange: 'transform' }}
          animate={reducedMotion ? { x: 0 } : { x: [0, -W] }}
          transition={reducedMotion ? {} : { duration: 24, repeat: Infinity, ease: 'linear' }}
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
              <path d={lavPath} fill="#C9D1FF" fillOpacity={0.7} />
            </svg>
          ))}
        </motion.div>
      </div>

      {/* 2) Dark navy wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: navH + 12 }}>
        <motion.div
          key={`nav-${W}`}
          style={{ display: 'flex', width: W * 2, willChange: 'transform' }}
          animate={reducedMotion ? { x: 0 } : { x: [0, -W] }}
          transition={reducedMotion ? {} : { duration: 18, repeat: Infinity, ease: 'linear' }}
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
              <path d={navPath} fill="#292E64" />
            </svg>
          ))}
        </motion.div>
      </div>

      {/* 3) Thin gold/terracotta accent line */}
      <div className="absolute left-0 w-full overflow-hidden" style={{ bottom: 55, height: 24 }}>
        <motion.div
          key={`gold-${W}`}
          style={{ display: 'flex', width: W * 2, willChange: 'transform' }}
          animate={reducedMotion ? { x: 0 } : { x: [0, -W] }}
          transition={reducedMotion ? {} : { duration: 20, repeat: Infinity, ease: 'linear' }}
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
              <path d={goldLine} fill="none" stroke="#E49C75" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ))}
        </motion.div>
      </div>

      {/* Solid fill at very bottom to prevent gaps */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: 28, background: '#292E64' }} />
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WaveLayerProps {
  color: string;
  opacity?: number;
  speed?: number;
  amplitude?: number;
  yOffset?: number;
  phase?: number;
  height?: number;
}

function generateWavePath(
  width: number,
  amplitude: number,
  frequency: number,
  phase: number,
  height: number,
): string {
  const points: string[] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y =
      amplitude * Math.sin((i / steps) * Math.PI * 2 * frequency + phase * Math.PI * 2) +
      amplitude * 0.5 * Math.sin((i / steps) * Math.PI * 2 * frequency * 1.7 + phase * Math.PI * 3);
    points.push(`${i === 0 ? 'M' : 'L'} ${x} ${amplitude * 2 + y}`);
  }

  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');

  return points.join(' ');
}

export function WaveLayer({
  color,
  opacity = 1,
  speed = 8,
  amplitude = 12,
  yOffset = 0,
  phase = 0,
  height = 120,
}: WaveLayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const viewWidth = 1600;
  const path = generateWavePath(viewWidth, amplitude, 1.5, phase, height);
  const svgHeight = height + amplitude * 3;

  return (
    <div
      className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none"
      style={{ bottom: yOffset, height: svgHeight }}
    >
      <motion.div
        className="flex"
        style={{ width: viewWidth * 2 }}
        animate={{ x: [0, -viewWidth] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          width={viewWidth}
          height={svgHeight}
          viewBox={`0 0 ${viewWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          style={{ flexShrink: 0 }}
        >
          <path d={path} fill={color} fillOpacity={opacity} />
        </svg>
        <svg
          width={viewWidth}
          height={svgHeight}
          viewBox={`0 0 ${viewWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          style={{ flexShrink: 0 }}
        >
          <path d={path} fill={color} fillOpacity={opacity} />
        </svg>
      </motion.div>
    </div>
  );
}

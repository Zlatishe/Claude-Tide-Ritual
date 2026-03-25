'use client';

import { useRef, useEffect, useCallback } from 'react';
import { sandInteraction } from '@/lib/sand-particles/particle-state';
import {
  createParticles,
  tickParticles,
  applyBurst,
  renderParticles,
  type Particle,
} from '@/lib/sand-particles/particle-engine';

/**
 * Full-viewport canvas that renders a grid of interactive sand particles.
 * Reads drag positions from the module-level sandInteraction singleton
 * every animation frame — no React re-renders in the hot path.
 */
export function SandParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef<number>(1);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    particlesRef.current = createParticles(width, height, dpr);
  }, []);

  useEffect(() => {
    initCanvas();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function loop() {
      // Process burst queue
      while (sandInteraction.burstQueue.length > 0) {
        const burst = sandInteraction.burstQueue.shift()!;
        applyBurst(particlesRef.current, burst.x, burst.y, burst.strength);
      }

      // Tick physics (frame-based, no dt needed)
      tickParticles(particlesRef.current, sandInteraction.dragSources);

      // Render
      renderParticles(ctx!, particlesRef.current, dprRef.current);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => initCanvas();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [initCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

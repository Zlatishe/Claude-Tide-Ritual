/**
 * Pure TypeScript particle physics engine.
 * No DOM, no React — just math. Called by SandParticleCanvas every frame.
 *
 * Particles are placed on a grid and use frame-based physics (no dt scaling)
 * for predictable, visible displacement that matches 60fps canvas rendering.
 */

import type { DragSource } from './particle-state';

export interface Particle {
  ox: number; // original x (grid home position, screen px)
  oy: number; // original y
  cx: number; // current x
  cy: number; // current y
  vx: number; // velocity x
  vy: number; // velocity y
}

// --- Physics constants (frame-based, not time-based) ---
const REPULSION_FORCE = 7; // Base push strength per frame
const SPRING = 0.025; // Return-to-home spring stiffness
const DAMPING = 0.82; // Velocity friction per frame (lower = more friction)
const BURST_FORCE = 12; // One-time impulse strength for landing
const BURST_RADIUS = 140; // How far the burst reaches (px)

// --- Visual constants — DPR-aware for consistent look across devices ---
const GRID_JITTER = 0; // No jitter — clean grid like the original
const MAX_PARTICLES = 15000; // Safety cap — only triggers on 4K+ viewports

interface VisualConfig {
  spacing: number;
  dotRadius: number;
  dotColor: string;
}

function getVisualConfig(dpr: number): VisualConfig {
  if (dpr > 1.5) {
    // High-DPR (mobile Retina) — subtler, original-feel values
    return { spacing: 16, dotRadius: 0.9, dotColor: 'rgba(228, 156, 117, 0.65)' };
  }
  // Standard DPR (desktop web) — enhanced visibility
  return { spacing: 13, dotRadius: 1.1, dotColor: 'rgba(228, 156, 117, 0.75)' };
}

// Active config — set by createParticles, read by renderParticles
let activeConfig: VisualConfig = getVisualConfig(1);

/**
 * Create particles on a regular grid across the sand area.
 * On very large viewports, grid spacing is widened to stay within MAX_PARTICLES.
 */
export function createParticles(width: number, height: number, dpr: number = 1): Particle[] {
  activeConfig = getVisualConfig(dpr);
  const gridSpacing = activeConfig.spacing;

  const particles: Particle[] = [];
  const yMin = height * 0.0;
  const yMax = height * 1.0;
  const xPad = 4; // Small edge padding

  // Estimate particle count at default spacing; widen if it would exceed cap
  const cols = Math.floor((width - xPad * 2) / gridSpacing);
  const rows = Math.floor((yMax - yMin) / gridSpacing);
  const estimated = cols * rows;
  const spacing = estimated > MAX_PARTICLES
    ? gridSpacing * Math.ceil(Math.sqrt(estimated / MAX_PARTICLES))
    : gridSpacing;

  for (let gx = xPad; gx < width - xPad; gx += spacing) {
    for (let gy = yMin; gy < yMax; gy += spacing) {
      const jx = gx + (Math.random() - 0.5) * GRID_JITTER;
      const jy = gy + (Math.random() - 0.5) * GRID_JITTER;
      particles.push({
        ox: jx,
        oy: jy,
        cx: jx,
        cy: jy,
        vx: 0,
        vy: 0,
      });
    }
  }

  return particles;
}

/**
 * Advance physics one frame. Mutates particles in-place.
 * Uses frame-based physics (no delta-time scaling) for consistent feel at 60fps.
 */
export function tickParticles(
  particles: Particle[],
  dragSources: Map<string, DragSource>,
): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    let fx = 0;
    let fy = 0;

    // --- Repulsion from each active drag source ---
    dragSources.forEach((source) => {
      if (!source.active) return;
      const dx = p.cx - source.x;
      const dy = p.cy - source.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      const radius = source.radius;

      if (dist < radius && dist > 1) {
        // Quadratic falloff: strongest at center, zero at edge
        const t = 1 - dist / radius;
        const force = t * t * REPULSION_FORCE;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
    });

    // --- Spring return to home position ---
    fx += (p.ox - p.cx) * SPRING;
    fy += (p.oy - p.cy) * SPRING;

    // --- Integrate (frame-based) ---
    p.vx = (p.vx + fx) * DAMPING;
    p.vy = (p.vy + fy) * DAMPING;

    p.cx += p.vx;
    p.cy += p.vy;
  }
}

/**
 * Apply a one-time impulse burst (e.g. shell landing on sand).
 * Particles within BURST_RADIUS are pushed outward then spring back.
 */
export function applyBurst(
  particles: Particle[],
  bx: number,
  by: number,
  strength: number = 1,
): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const dx = p.cx - bx;
    const dy = p.cy - by;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < BURST_RADIUS && dist > 1) {
      const t = 1 - dist / BURST_RADIUS;
      const force = t * t * BURST_FORCE * strength;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
  }
}

/**
 * Render all particles to a 2D canvas context.
 * Single draw call for performance — all dots share one color/size.
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  dpr: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = activeConfig.dotColor;
  ctx.beginPath();

  const r = activeConfig.dotRadius * dpr;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const px = p.cx * dpr;
    const py = p.cy * dpr;
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, Math.PI * 2);
  }

  ctx.fill();
}

'use client';

/**
 * Sandbox config store.
 *
 * Holds scene controls + state-shape sliders for the /sandbox visual QA route.
 * After FIX-03, the FIX-01/02 design-experiment toggles are gone (their winners
 * shipped to prod). Remaining experiments target the tide-release climax
 * (FIX-03 §4) — wave organic-ness applied to the wash-away moment.
 *
 * In production (the main app route) this store is never written to and
 * always returns its initial values, so reading from it is a no-op.
 */

import { create } from 'zustand';

export type SandboxScene = 'beach' | 'onboarding' | 'signin';

/**
 * Per-layer easing options for the tide-release rise transition.
 * - 'out':     cubic [0,0,0.58,1] (current prod default — gentle ease-out)
 * - 'linear':  no easing
 * - 'inOut':   [0.42,0,0.58,1]
 * - 'back':    [0.34,1.56,0.64,1] — soft overshoot, bounded by duration (no oscillation)
 * - 'expo':    [0.16,1,0.3,1] — very sharp start, slow finish
 * - 'spring':  physics spring (uses tideSpringStiffness/Damping/Mass; ignores duration)
 */
export type TideEasing = 'out' | 'linear' | 'inOut' | 'back' | 'expo' | 'spring';

interface SandboxState {
  // Scene navigation
  scene: SandboxScene;
  onboardingStep: number;

  // Beach state controls
  inscribedShellCount: number;
  jarStoneCount: number;

  // Modal triggers
  forceJarModalOpen: boolean;
  forceInscriptionModalOpen: boolean;
  forceTideInProgress: boolean;

  // Display
  forceReducedMotion: boolean;
  hideUIChrome: boolean;
  controlsOpen: boolean;
  controlsSide: 'left' | 'right';

  // FIX-03 §4 — Tide-release wave experiments (independent toggles).
  // (tideStaggeredEasing removed in favor of granular per-layer controls below.)
  tideHarmonicCrests: boolean;
  tideLateralSwell: boolean;
  tideCrestMorphing: boolean;
  tideFoamStreaks: boolean;
  tidePeakBobbing: boolean;

  // FIX-03 §4 (refined) — Per-layer RISE easing, delay, duration.
  // Defaults match current prod behavior (uniform ease-out, staggered delays).
  tideLayer1Ease: TideEasing;
  tideLayer1Delay: number;     // ms
  tideLayer1Duration: number;  // ms (ignored when ease === 'spring')
  tideLayer2Ease: TideEasing;
  tideLayer2Delay: number;
  tideLayer2Duration: number;
  tideLayer3Ease: TideEasing;
  tideLayer3Delay: number;
  tideLayer3Duration: number;

  // Per-layer RECEDE easing, delay, duration. Separate from rise so the user
  // can dial in drain timing independently — physically, foam (layer 3) drains
  // FIRST while the wave body (layer 1) lingers, which is the opposite stagger
  // from rise. Defaults reflect that: layer 1 has the longest recede + biggest
  // delay; layer 3 starts immediately with the shortest duration.
  tideLayer1RecedeEase: TideEasing;
  tideLayer1RecedeDelay: number;
  tideLayer1RecedeDuration: number;
  tideLayer2RecedeEase: TideEasing;
  tideLayer2RecedeDelay: number;
  tideLayer2RecedeDuration: number;
  tideLayer3RecedeEase: TideEasing;
  tideLayer3RecedeDelay: number;
  tideLayer3RecedeDuration: number;

  // Spring physics params (consumed by any layer with ease === 'spring',
  // shared between rise and recede).
  tideSpringStiffness: number;
  tideSpringDamping: number;
  tideSpringMass: number;

  // Setters
  set: <K extends keyof Omit<SandboxState, 'set' | 'reset'>>(
    key: K,
    value: SandboxState[K]
  ) => void;
  reset: () => void;
}

const initial = {
  scene: 'beach' as SandboxScene,
  onboardingStep: 0,
  inscribedShellCount: 0,
  jarStoneCount: 0,
  forceJarModalOpen: false,
  forceInscriptionModalOpen: false,
  forceTideInProgress: false,
  forceReducedMotion: false,
  hideUIChrome: false,
  controlsOpen: true,
  controlsSide: 'right' as 'left' | 'right',

  tideHarmonicCrests: false,
  tideLateralSwell: false,
  tideCrestMorphing: false,
  tideFoamStreaks: false,
  tidePeakBobbing: false,

  // RISE defaults match production behavior:
  // - All layers use cubic ease-out.
  // - Layer 1 starts immediately; 2 delays 200ms; 3 delays 400ms.
  // - Durations: 3000 / 3300 / 3500 ms (each successive layer slightly longer).
  tideLayer1Ease: 'out' as TideEasing,
  tideLayer1Delay: 0,
  tideLayer1Duration: 3000,
  tideLayer2Ease: 'out' as TideEasing,
  tideLayer2Delay: 200,
  tideLayer2Duration: 3300,
  tideLayer3Ease: 'out' as TideEasing,
  tideLayer3Delay: 400,
  tideLayer3Duration: 3500,

  // RECEDE defaults: reverse-staggered so foam (layer 3) drains first.
  // Layer 1 deepest waits longest then drains slowest (body lingers).
  tideLayer1RecedeEase: 'out' as TideEasing,
  tideLayer1RecedeDelay: 400,
  tideLayer1RecedeDuration: 3500,
  tideLayer2RecedeEase: 'out' as TideEasing,
  tideLayer2RecedeDelay: 200,
  tideLayer2RecedeDuration: 3200,
  tideLayer3RecedeEase: 'out' as TideEasing,
  tideLayer3RecedeDelay: 0,
  tideLayer3RecedeDuration: 2800,

  tideSpringStiffness: 60,
  tideSpringDamping: 12,
  tideSpringMass: 1.4,
};

export const useSandboxStore = create<SandboxState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<SandboxState>),
  reset: () => set(initial),
}));

'use client';

/**
 * Sandbox config store.
 *
 * Holds scene controls + state-shape sliders for the /sandbox visual QA route.
 * After FIX-03, the FIX-01/02 design-experiment toggles are gone (their winners
 * shipped to prod). The remaining "design experiments" slot is reserved for
 * the FIX-03 §4 tide-wave toggles (coming next pass).
 *
 * In production (the main app route) this store is never written to and
 * always returns its initial values, so reading from it is a no-op.
 */

import { create } from 'zustand';

export type SandboxScene = 'beach' | 'onboarding' | 'signin';

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

  // FIX-03 §4 — Tide-release wave experiments (independent toggles, mix & match)
  tideHarmonicCrests: boolean;     // sine-based crests with secondary harmonic
  tideStaggeredEasing: boolean;    // per-layer easing variation; spring on lavender
  tideLateralSwell: boolean;       // mid layer slides in laterally during rise
  tideCrestMorphing: boolean;      // crest paths cycle through phase snapshots
  tideFoamStreaks: boolean;        // foam lines drift during peak
  tidePeakBobbing: boolean;        // micro y-translate during peak

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
  tideStaggeredEasing: false,
  tideLateralSwell: false,
  tideCrestMorphing: false,
  tideFoamStreaks: false,
  tidePeakBobbing: false,
};

export const useSandboxStore = create<SandboxState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<SandboxState>),
  reset: () => set(initial),
}));

'use client';

/**
 * Sandbox config store.
 *
 * Holds scene controls + state-shape sliders for the /sandbox visual QA route.
 * All design-experiment toggles from FIX-01 through FIX-03 have shipped to
 * production — this store now only carries the QA navigation/state controls.
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
};

export const useSandboxStore = create<SandboxState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<SandboxState>),
  reset: () => set(initial),
}));
